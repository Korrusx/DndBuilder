// Сессии кампании в пользовательской базе.

import type { SQLiteDatabase } from 'expo-sqlite';

import type { Session } from '../model/types';
import { rowToSession, sessionToRow } from './serialize';
import type { SessionRow } from './types';
import { upsert } from './upsert';

/** Сессии кампании по номерам. */
export async function listSessions(db: SQLiteDatabase, campaignId: string): Promise<Session[]> {
  const rows = await db.getAllAsync<SessionRow>(
    'SELECT * FROM sessions WHERE campaign_id = ? ORDER BY number',
    campaignId,
  );
  return rows.map(rowToSession);
}

/** Идущая сейчас сессия (не завершённая, с самым большим номером) или null. */
export async function activeSession(db: SQLiteDatabase, campaignId: string): Promise<Session | null> {
  const row = await db.getFirstAsync<SessionRow>(
    'SELECT * FROM sessions WHERE campaign_id = ? AND ended_at IS NULL ORDER BY number DESC',
    campaignId,
  );
  return row ? rowToSession(row) : null;
}

export async function saveSession(db: SQLiteDatabase, session: Session): Promise<Session> {
  const saved = { ...session, updatedAt: new Date().toISOString() };
  await upsert(db, 'sessions', sessionToRow(saved), ['id']);
  return saved;
}
