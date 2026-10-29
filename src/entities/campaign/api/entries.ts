// Записи летописи (заметки и автособытия) в пользовательской базе.

import type { SQLiteDatabase } from 'expo-sqlite';

import type { Entry } from '../model/types';
import { entryToRow, rowToEntry } from './serialize';
import type { EntryRow } from './types';
import { upsert } from './upsert';

/** Все записи кампании по времени. */
export async function listEntries(db: SQLiteDatabase, campaignId: string): Promise<Entry[]> {
  const rows = await db.getAllAsync<EntryRow>(
    'SELECT * FROM entries WHERE campaign_id = ? ORDER BY created_at',
    campaignId,
  );
  return rows.map(rowToEntry);
}

/** Создаёт или обновляет запись. Время изменения ставится автоматически. */
export async function saveEntry(db: SQLiteDatabase, entry: Entry): Promise<Entry> {
  const saved = { ...entry, updatedAt: new Date().toISOString() };
  await upsert(db, 'entries', entryToRow(saved), ['id']);
  return saved;
}

export async function deleteEntries(db: SQLiteDatabase, ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }
  await db.runAsync(`DELETE FROM entries WHERE id IN (${ids.map(() => '?').join(', ')})`, ids);
}
