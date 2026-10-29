// Летопись по блокам: сессии от новой к старой, между ними — записи «между сессиями».

import { STALE_SESSION_MS } from '../config/constants';
import { coalesceEvents, entryEvent, eventText } from './events';
import { plainText } from './mentions';
import { foldText } from './search';
import type { CampaignCharacter, Entity, Entry, Session, TimelineGroup } from './types';

const notes = (entries: Entry[]) => entries.filter((entry) => entry.kind === 'note').length;

/** Последняя сессия, начавшаяся не позже `at` (к ней относятся записи «между сессиями» после неё). */
function sessionBefore(at: string, sessions: Session[]): Session | null {
  let found: Session | null = null;
  for (const session of sessions) {
    if (session.startedAt <= at && (!found || session.number > found.number)) {
      found = session;
    }
  }
  return found;
}

export function timelineGroups(sessions: Session[], entries: Entry[]): TimelineGroup[] {
  const bySession = new Map<string, Entry[]>();
  const between = new Map<string, Entry[]>();
  for (const entry of entries) {
    if (entry.sessionId) {
      bySession.set(entry.sessionId, [...(bySession.get(entry.sessionId) ?? []), entry]);
    } else {
      const key = sessionBefore(entry.createdAt, sessions)?.id ?? '';
      between.set(key, [...(between.get(key) ?? []), entry]);
    }
  }
  const betweenGroup = (after: Session | null): TimelineGroup[] => {
    const list = between.get(after?.id ?? '') ?? [];
    return list.length
      ? [
          {
            kind: 'between',
            key: `between-${after?.id ?? 'start'}`,
            after,
            items: coalesceEvents(list),
            noteCount: notes(list),
            entryCount: list.length,
          },
        ]
      : [];
  };
  const groups: TimelineGroup[] = [];
  for (const session of [...sessions].sort((a, b) => b.number - a.number)) {
    const list = bySession.get(session.id) ?? [];
    groups.push(...betweenGroup(session), {
      kind: 'session',
      key: session.id,
      session,
      items: coalesceEvents(list),
      noteCount: notes(list),
      entryCount: list.length,
    });
  }
  return [...groups, ...betweenGroup(null)];
}

/** Первая строка первой заметки — для свёрнутой карточки сессии. */
export function firstLine(group: TimelineGroup, entitiesById: ReadonlyMap<string, Entity>): string {
  for (const item of group.items) {
    if (item.kind === 'note') {
      return plainText(item.entry.text, entitiesById).split('\n')[0].trim();
    }
  }
  return '';
}

export const nextSessionNumber = (sessions: Session[]) => Math.max(0, ...sessions.map((session) => session.number)) + 1;

export const activeSessionOf = (sessions: Session[]): Session | null =>
  [...sessions].sort((a, b) => b.number - a.number).find((session) => !session.endedAt) ?? null;

/** Идущая сессия, в которой ничего не происходило дольше 12 часов (забыли завершить). */
export function isForgottenSession(session: Session, entries: Entry[], now: string): boolean {
  if (session.endedAt) {
    return false;
  }
  const last = entries
    .filter((entry) => entry.sessionId === session.id)
    .reduce((latest, entry) => (entry.createdAt > latest ? entry.createdAt : latest), session.startedAt);
  return new Date(now).getTime() - new Date(last).getTime() > STALE_SESSION_MS;
}

/** Поиск по хронике: текст заметок (с текущими именами) и автособытий, от новых к старым. */
export function searchEntries(query: string, entries: Entry[], entitiesById: ReadonlyMap<string, Entity>): Entry[] {
  const folded = foldText(query);
  if (!folded) {
    return [];
  }
  return entries
    .filter((entry) => {
      const event = entryEvent(entry);
      const text = event ? eventText(event, entitiesById) : plainText(entry.text, entitiesById);
      return foldText(text).includes(folded);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** «Зал героев»: павшие и ушедшие на покой, сначала недавние. */
export const hallOfHeroes = (participants: CampaignCharacter[]) =>
  participants
    .filter((participant) => participant.status !== 'active')
    .sort((a, b) => (b.leftAt ?? b.updatedAt).localeCompare(a.leftAt ?? a.updatedAt));
