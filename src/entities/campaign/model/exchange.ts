// Файл хроники кампании: собрать, проверить при чтении, переназначить id героев (при импорте персонажи получают новые id).

import { t } from '@/shared/i18n';

import { CHRONICLE_EXTENSION, CHRONICLE_FORMAT, CHRONICLE_VERSION } from '../config/constants';
import type { CampaignData, ChronicleFile } from './types';

export class ChronicleImportError extends Error {}

export function buildChronicleFile(data: CampaignData, photos: Record<string, string>, now: string): ChronicleFile {
  return {
    format: CHRONICLE_FORMAT,
    version: CHRONICLE_VERSION,
    exportedAt: now,
    campaign: data.campaign,
    participants: data.participants,
    sessions: data.sessions,
    entries: data.entries,
    entities: data.entities,
    steps: data.steps,
    counters: data.counters,
    links: data.links,
    photos,
  };
}

/** Какие фото нужны хронике: из заметок и портреты карточек. */
export const chroniclePhotoIds = (data: Pick<CampaignData, 'entries' | 'entities'>) => [
  ...new Set([
    ...data.entries.flatMap((entry) => entry.photoIds),
    ...data.entities.flatMap((entity) => (entity.portraitPhotoId ? [entity.portraitPhotoId] : [])),
  ]),
];

/** «Тени Солёной Гавани.geroy-chronicle.json». */
export function chronicleFileName(name: string): string {
  const safe = name
    .replace(/[\\/:*?"<>|\n\r\t]+/g, ' ')
    .trim()
    .slice(0, 60);
  return `${safe || t('chronicle.files.unnamed')}${CHRONICLE_EXTENSION}`;
}

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const hasStrings = (x: unknown, keys: string[]) => isObject(x) && keys.every((key) => typeof x[key] === 'string');

/** Похоже ли на файл хроники (а не персонажей). */
export const isChronicleData = (data: unknown) => isObject(data) && data.format === CHRONICLE_FORMAT;

/** Список одного вида: записи без обязательных полей пропускаются, их число — в `skipped`. */
function list<T>(raw: unknown, keys: string[], counter: { skipped: number }): T[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const valid = raw.filter((item) => hasStrings(item, keys));
  counter.skipped += raw.length - valid.length;
  return valid as T[];
}

/**
 * Проверяет прочитанный JSON. Кампания без id и названия — ошибка; отдельные испорченные записи пропускаются.
 * Возвращает файл и число пропущенных записей.
 */
export function parseChronicle(data: unknown): { file: ChronicleFile; skipped: number } {
  if (!isChronicleData(data) || !isObject(data)) {
    throw new ChronicleImportError(t('chronicle.files.notOurs'));
  }
  if (typeof data.version !== 'number' || data.version > CHRONICLE_VERSION) {
    throw new ChronicleImportError(t('chronicle.files.newer'));
  }
  if (!hasStrings(data.campaign, ['id', 'name', 'createdAt'])) {
    throw new ChronicleImportError(t('chronicle.files.noCampaign'));
  }
  const counter = { skipped: 0 };
  const entries = list<ChronicleFile['entries'][number]>(data.entries, ['id', 'kind', 'createdAt'], counter).map(
    (entry) => ({
      ...entry,
      text: typeof entry.text === 'string' ? entry.text : '',
      tags: Array.isArray(entry.tags) ? entry.tags : [],
      photoIds: Array.isArray(entry.photoIds) ? entry.photoIds.filter((id) => typeof id === 'string') : [],
      secret: entry.secret === true,
      sessionId: typeof entry.sessionId === 'string' ? entry.sessionId : null,
    }),
  );
  const photos: Record<string, string> = {};
  if (isObject(data.photos)) {
    for (const [id, value] of Object.entries(data.photos)) {
      if (typeof value === 'string') {
        photos[id] = value;
      }
    }
  }
  const campaign = data.campaign as ChronicleFile['campaign'];
  const file: ChronicleFile = {
    format: CHRONICLE_FORMAT,
    version: CHRONICLE_VERSION,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
    campaign: {
      ...campaign,
      updatedAt: typeof campaign.updatedAt === 'string' ? campaign.updatedAt : campaign.createdAt,
    },
    participants: list(data.participants, ['campaignId', 'characterId', 'status', 'joinedAt'], counter),
    sessions: list<ChronicleFile['sessions'][number]>(data.sessions, ['id', 'startedAt'], counter).filter(
      (session) => typeof session.number === 'number',
    ),
    entries,
    entities: list<ChronicleFile['entities'][number]>(data.entities, ['id', 'type', 'name'], counter).map((entity) => ({
      ...entity,
      role: typeof entity.role === 'string' ? entity.role : '',
      description: typeof entity.description === 'string' ? entity.description : '',
      attitude: typeof entity.attitude === 'number' ? entity.attitude : 0,
      personal: entity.personal === true,
    })),
    steps: list(data.steps, ['id', 'questId', 'text'], counter),
    counters: list<ChronicleFile['counters'][number]>(data.counters, ['questId', 'unit'], counter).filter(
      (item) => typeof item.target === 'number' && typeof item.current === 'number',
    ),
    links: list(data.links, ['id', 'fromId', 'toId'], counter),
    photos,
  };
  // Всё внутри — этой кампании (файл могли собрать вручную).
  const campaignId = file.campaign.id;
  for (const key of ['participants', 'sessions', 'entries', 'entities'] as const) {
    for (const item of file[key]) {
      (item as { campaignId: string }).campaignId = campaignId;
    }
  }
  return { file, skipped: counter.skipped };
}

/** Персонажи при импорте получили новые id — хроника должна указывать на них. Неизвестные id не трогаются. */
export function remapCharacters(file: ChronicleFile, idMap: Readonly<Record<string, string>>): ChronicleFile {
  const map = (id: string) => idMap[id] ?? id;
  return {
    ...file,
    participants: file.participants.map((participant) => ({
      ...participant,
      characterId: map(participant.characterId),
    })),
    entries: file.entries.map((entry) =>
      entry.characterId ? { ...entry, characterId: map(entry.characterId) } : entry,
    ),
  };
}
