// Упоминания карточек в тексте записей. В базе: токен `@[Борис](e:<id>)`; показывается всегда текущее имя карточки,
// поэтому переименование карточки обновляет все записи. В редакторе — «@Борис» плюс отдельный список диапазонов.

import { SNIPPET_RADIUS } from '../config/constants';
import type {
  Entity,
  Entry,
  MentionDoc,
  MentionHit,
  MentionQuery,
  Mention,
  MentionRange,
  Segment,
  Session,
} from './types';

const TOKEN = /@\[([^\]\n]*)\]\(e:([A-Za-z0-9_-]+)\)/g;

/** Имя в токене не должно ломать разметку. */
const safeName = (name: string) => name.replace(/[\]\n]/g, ' ').trim();

export const mentionToken = (entity: Pick<Entity, 'id' | 'name'>) => `@[${safeName(entity.name)}](e:${entity.id})`;

export function parseMentions(text: string): Mention[] {
  return [...text.matchAll(TOKEN)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
    entityId: match[2],
    name: match[1],
  }));
}

/** Текст записи по кусочкам для отрисовки: обычный текст и упоминания с текущими именами. */
export function renderSegments(text: string, entitiesById: ReadonlyMap<string, Entity>): Segment[] {
  const segments: Segment[] = [];
  let position = 0;
  for (const mention of parseMentions(text)) {
    if (mention.start > position) {
      segments.push({ kind: 'text', text: text.slice(position, mention.start) });
    }
    const entity = entitiesById.get(mention.entityId);
    segments.push({
      kind: 'mention',
      entityId: mention.entityId,
      name: entity?.name ?? mention.name,
      missing: !entity,
    });
    position = mention.end;
  }
  if (position < text.length) {
    segments.push({ kind: 'text', text: text.slice(position) });
  }
  return segments;
}

/** Текст записи без разметки: упоминания заменены текущими именами (для сводки, поиска, «Поделиться»). */
export function plainText(text: string, entitiesById: ReadonlyMap<string, Entity>): string {
  return renderSegments(text, entitiesById)
    .map((segment) => (segment.kind === 'text' ? segment.text : segment.name))
    .join('');
}

// --- Редактор ---

/** Текст из базы → текст редактора («@Борис») и диапазоны упоминаний. */
export function toMentionDoc(text: string, entitiesById: ReadonlyMap<string, Entity>): MentionDoc {
  let display = '';
  const mentions: MentionRange[] = [];
  for (const segment of renderSegments(text, entitiesById)) {
    if (segment.kind === 'text') {
      display += segment.text;
    } else {
      const shown = `@${segment.name}`;
      mentions.push({ start: display.length, end: display.length + shown.length, entityId: segment.entityId });
      display += shown;
    }
  }
  return { text: display, mentions };
}

/** Текст редактора → текст для базы с токенами. */
export function fromMentionDoc(doc: MentionDoc): string {
  let result = '';
  let position = 0;
  for (const mention of [...doc.mentions].sort((a, b) => a.start - b.start)) {
    result += doc.text.slice(position, mention.start);
    result += mentionToken({ id: mention.entityId, name: doc.text.slice(mention.start + 1, mention.end) });
    position = mention.end;
  }
  return result + doc.text.slice(position);
}

/**
 * Игрок изменил текст в поле ввода. Упоминания до правки остаются, после — сдвигаются,
 * а задетые правкой превращаются в обычный текст (стёр букву в «@Борис» — упоминания больше нет).
 */
export function applyTextChange(doc: MentionDoc, nextText: string): MentionDoc {
  const previous = doc.text;
  let prefix = 0;
  const maxPrefix = Math.min(previous.length, nextText.length);
  while (prefix < maxPrefix && previous[prefix] === nextText[prefix]) {
    prefix++;
  }
  let suffix = 0;
  const maxSuffix = Math.min(previous.length, nextText.length) - prefix;
  while (suffix < maxSuffix && previous[previous.length - 1 - suffix] === nextText[nextText.length - 1 - suffix]) {
    suffix++;
  }
  const changeStart = prefix;
  const changeEnd = previous.length - suffix;
  const delta = nextText.length - previous.length;
  const mentions: MentionRange[] = [];
  for (const mention of doc.mentions) {
    if (mention.end <= changeStart) {
      mentions.push(mention);
    } else if (mention.start >= changeEnd) {
      mentions.push({ ...mention, start: mention.start + delta, end: mention.end + delta });
    }
  }
  return { text: nextText, mentions };
}

/** Набираемое сейчас упоминание: текст после `@` до курсора (не больше двух слов) или null. */
export function findMentionQuery(doc: MentionDoc, cursor: number): MentionQuery | null {
  if (doc.mentions.some((mention) => cursor > mention.start && cursor <= mention.end)) {
    return null;
  }
  const before = doc.text.slice(0, cursor);
  const at = before.lastIndexOf('@');
  if (at < 0 || doc.mentions.some((mention) => mention.start === at)) {
    return null;
  }
  if (at > 0 && !/[\s([«"'—-]/.test(before[at - 1])) {
    return null;
  }
  const query = before.slice(at + 1);
  if (query.length > 40 || /\n/.test(query) || /^\s/.test(query) || query.split(' ').length > 2) {
    return null;
  }
  return { start: at, query };
}

/** Заменяет набранное «@Бор» на упоминание карточки и ставит курсор после него (с пробелом). */
export function insertMention(
  doc: MentionDoc,
  cursor: number,
  query: MentionQuery,
  entity: Pick<Entity, 'id' | 'name'>,
): { doc: MentionDoc; cursor: number } {
  const shown = `@${safeName(entity.name)}`;
  const after = doc.text.slice(cursor);
  const space = after.startsWith(' ') ? '' : ' ';
  const text = doc.text.slice(0, query.start) + shown + space + after;
  const delta = text.length - doc.text.length;
  const mentions = doc.mentions
    .map((mention) =>
      mention.start >= cursor ? { ...mention, start: mention.start + delta, end: mention.end + delta } : mention,
    )
    .concat({ start: query.start, end: query.start + shown.length, entityId: entity.id })
    .sort((a, b) => a.start - b.start);
  return { doc: { text, mentions }, cursor: query.start + shown.length + 1 };
}

// --- Упоминания карточки ---

const mentionsEntity = (entry: Entry, entityId: string) =>
  entry.kind === 'note' && parseMentions(entry.text).some((mention) => mention.entityId === entityId);

/** Записи с упоминанием карточки, от новых к старым, с кусочком текста вокруг первого упоминания. */
export function mentionsOf(
  entityId: string,
  entries: Entry[],
  entitiesById: ReadonlyMap<string, Entity>,
): MentionHit[] {
  return entries
    .filter((entry) => mentionsEntity(entry, entityId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((entry) => ({ entry, snippet: snippetAround(entry.text, entityId, entitiesById) }));
}

function snippetAround(text: string, entityId: string, entitiesById: ReadonlyMap<string, Entity>): string {
  let plain = '';
  let at = -1;
  for (const segment of renderSegments(text, entitiesById)) {
    if (segment.kind === 'mention' && segment.entityId === entityId && at < 0) {
      at = plain.length;
    }
    plain += segment.kind === 'text' ? segment.text : segment.name;
  }
  plain = plain.replace(/\s+/g, ' ').trim();
  if (plain.length <= SNIPPET_RADIUS * 2) {
    return plain;
  }
  const start = Math.max(0, at - SNIPPET_RADIUS);
  const end = Math.min(plain.length, start + SNIPPET_RADIUS * 2);
  return `${start > 0 ? '…' : ''}${plain.slice(start, end).trim()}${end < plain.length ? '…' : ''}`;
}

/** Сессия, в которой карточку упомянули впервые (записи «между сессиями» не считаются). */
export function firstSeenSession(entityId: string, entries: Entry[], sessions: Session[]): Session | null {
  const byId = new Map(sessions.map((session) => [session.id, session]));
  let first: Session | null = null;
  for (const entry of entries) {
    const session = entry.sessionId ? byId.get(entry.sessionId) : undefined;
    if (session && mentionsEntity(entry, entityId) && (!first || session.number < first.number)) {
      first = session;
    }
  }
  return first;
}
