// Карточки хроники (люди, места, фракции, квесты) в пользовательской базе.

import type { SQLiteDatabase } from 'expo-sqlite';

import type { Entity } from '../model/types';
import { entityToRow, rowToEntity } from './serialize';
import type { EntityRow } from './types';
import { upsert } from './upsert';

export async function listEntities(db: SQLiteDatabase, campaignId: string): Promise<Entity[]> {
  const rows = await db.getAllAsync<EntityRow>(
    'SELECT * FROM entities WHERE campaign_id = ? ORDER BY name COLLATE NOCASE',
    campaignId,
  );
  return rows.map(rowToEntity);
}

/** Создаёт или обновляет карточку. Время изменения ставится автоматически. */
export async function saveEntity(db: SQLiteDatabase, entity: Entity): Promise<Entity> {
  const saved = { ...entity, updatedAt: new Date().toISOString() };
  await upsert(db, 'entities', entityToRow(saved), ['id']);
  return saved;
}

/** Удаляет карточку с её шагами, счётчиком и связями. В записях упоминание остаётся с прежним именем. */
export async function deleteEntity(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM quest_steps WHERE quest_id = ?', id);
    await db.runAsync('DELETE FROM quest_counters WHERE quest_id = ?', id);
    await db.runAsync('DELETE FROM entity_links WHERE from_id = ? OR to_id = ?', id, id);
    await db.runAsync('DELETE FROM entities WHERE id = ?', id);
  });
}
