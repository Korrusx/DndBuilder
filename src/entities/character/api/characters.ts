// Работа с персонажами в пользовательской базе.

import type { SQLiteDatabase } from 'expo-sqlite';

import type { Character } from '../model/character';
import { characterToRow, rowToCharacter, type CharacterRow } from './serialize';

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Все персонажи, сначала недавно изменённые. */
export async function listCharacters(db: SQLiteDatabase): Promise<Character[]> {
  const rows = await db.getAllAsync<CharacterRow>('SELECT * FROM characters ORDER BY updated_at DESC');
  return rows.map(rowToCharacter);
}

export async function getCharacter(db: SQLiteDatabase, id: string): Promise<Character | null> {
  const row = await db.getFirstAsync<CharacterRow>('SELECT * FROM characters WHERE id = ?', id);
  return row ? rowToCharacter(row) : null;
}

/** Создаёт или обновляет персонажа. Время изменения ставится автоматически. */
export async function saveCharacter(db: SQLiteDatabase, c: Character): Promise<Character> {
  const saved = { ...c, updatedAt: new Date().toISOString() };
  const r = characterToRow(saved);
  await db.runAsync(
    `INSERT INTO characters (id, name, status, draft_step, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, status = excluded.status, draft_step = excluded.draft_step,
       data = excluded.data, updated_at = excluded.updated_at`,
    r.id, r.name, r.status, r.draft_step, r.data, r.created_at, r.updated_at,
  );
  return saved;
}

/** Сохраняет сразу несколько персонажей одной транзакцией (импорт из файла). */
export async function saveCharacters(db: SQLiteDatabase, list: Character[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const c of list) await saveCharacter(db, c);
  });
}

export async function deleteCharacter(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM characters WHERE id = ?', id);
}

/** Удаляет сразу несколько персонажей одной транзакцией. */
export async function deleteCharacters(db: SQLiteDatabase, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db.withTransactionAsync(async () => {
    for (const id of ids) await db.runAsync('DELETE FROM characters WHERE id = ?', id);
  });
}
