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
