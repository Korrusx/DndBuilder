// Фото записей и портреты: JPEG в base64 прямо в базе (в Expo Go так надёжнее, чем файлы, и они попадают в экспорт).

import type { SQLiteDatabase } from 'expo-sqlite';

import { newId } from '@/shared/lib/id';

export async function savePhoto(db: SQLiteDatabase, base64: string): Promise<string> {
  const id = newId();
  await db.runAsync('INSERT INTO photos (id, data, created_at) VALUES (?, ?, ?)', id, base64, new Date().toISOString());
  return id;
}

/** Фото по id → data-URI для <Image>. Отсутствующие пропускаются. */
export async function loadPhotos(db: SQLiteDatabase, ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) {
    return {};
  }
  const rows = await db.getAllAsync<{ id: string; data: string }>(
    `SELECT id, data FROM photos WHERE id IN (${ids.map(() => '?').join(', ')})`,
    ids,
  );
  return Object.fromEntries(rows.map((row) => [row.id, `data:image/jpeg;base64,${row.data}`]));
}

export async function deletePhotos(db: SQLiteDatabase, ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }
  await db.runAsync(`DELETE FROM photos WHERE id IN (${ids.map(() => '?').join(', ')})`, ids);
}
