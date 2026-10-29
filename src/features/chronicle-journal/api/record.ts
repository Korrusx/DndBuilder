// Запись автособытия в летопись: кампания персонажа → идущая сессия или «между сессиями».

import type { SQLiteDatabase } from 'expo-sqlite';

import type { ChronicleEvent, Entry } from '@/entities/campaign';
import { eventEntryFields } from '@/entities/campaign';
import { activeSession, participationOf, saveEntry } from '@/entities/campaign/api';
import { newId } from '@/shared/lib/id';

import { isRecorded } from '../model/settings';
import type { JournalState, JournalTarget } from '../model/types';
import { loadJournalSettings } from './settings';

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
