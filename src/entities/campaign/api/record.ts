// Запись автособытия в летопись: кампания персонажа → идущая сессия или «между сессиями».

import type { SQLiteDatabase } from 'expo-sqlite';

import { newId } from '@/shared/lib/id';

import { eventEntryFields } from '../model/events';
import { isRecorded } from '../model/journalSettings';
import type { ChronicleEvent, Entry, JournalState, JournalTarget } from '../model/types';
import { participationOf } from './campaigns';
import { notifyCampaignChanged } from './changes';
import { deleteEntries, listEntries, saveEntry } from './entries';
import { loadJournalSettings } from './journalSettings';
import { activeSession } from './sessions';

/** Куда писать события персонажа; null — он не в кампании (или уже в «Зале героев»). */
export async function journalTarget(db: SQLiteDatabase, characterId: string): Promise<JournalTarget | null> {
  const participation = await participationOf(db, characterId);
  if (!participation || participation.status !== 'active') {
    return null;
  }
  const session = await activeSession(db, participation.campaignId);
  return { campaignId: participation.campaignId, sessionId: session?.id ?? null };
}

/** Куда сейчас пишутся события героя (для подсказки на «Листе»). */
export async function journalState(db: SQLiteDatabase, characterId: string): Promise<JournalState> {
  const participation = await participationOf(db, characterId);
  if (!participation) {
    return { kind: 'none' };
  }
  if (participation.status !== 'active') {
    return { kind: 'hall', campaignId: participation.campaignId };
  }
  const session = await activeSession(db, participation.campaignId);
  return session
    ? { kind: 'session', campaignId: participation.campaignId, number: session.number }
    : { kind: 'between', campaignId: participation.campaignId };
}

/**
 * Записывает событие. Кампанию можно указать сразу (события самой хроники), иначе — по персонажу.
 * Возвращает запись или null, если писать некуда или эта группа событий выключена в настройках.
 */
export async function recordEvent(
  db: SQLiteDatabase,
  event: ChronicleEvent,
  options: { characterId?: string; campaignId?: string; at?: string },
): Promise<Entry | null> {
  if (!isRecorded(await loadJournalSettings(db), event.type)) {
    return null;
  }
  let target: JournalTarget | null = null;
  if (options.campaignId) {
    const session = await activeSession(db, options.campaignId);
    target = { campaignId: options.campaignId, sessionId: session?.id ?? null };
  } else if (options.characterId) {
    target = await journalTarget(db, options.characterId);
  }
  if (!target) {
    return null;
  }
  const at = options.at ?? new Date().toISOString();
  return saveEntry(db, {
    id: newId(),
    campaignId: target.campaignId,
    sessionId: target.sessionId,
    createdAt: at,
    text: '',
    tags: [],
    secret: false,
    characterId: options.characterId,
    photoIds: [],
    updatedAt: at,
    ...eventEntryFields(event),
  });
}

/**
 * Удалить последнюю запись «новый уровень» персонажа (при отмене повышения уровня).
 * Возвращает, нашлась ли запись: без кампании или при выключенной группе событий её нет.
 */
export async function deleteLevelEvent(db: SQLiteDatabase, characterId: string, level: number): Promise<boolean> {
  const participation = await participationOf(db, characterId);
  if (!participation) {
    return false;
  }
  const entries = await listEntries(db, participation.campaignId);
  const entry = entries
    .filter((e) => e.characterId === characterId && e.eventType === 'level' && e.eventData?.level === level)
    .at(-1);
  if (!entry) {
    return false;
  }
  await deleteEntries(db, [entry.id]);
  notifyCampaignChanged(participation.campaignId);
  return true;
}
