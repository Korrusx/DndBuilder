// Пользовательская база (персонажи). Справочник хранится отдельно — см. src/content.
export * from '@/entities/character/api/characters';
export * from './meta';
export * from './migrations';
export * from '@/entities/character/api/serialize';

import { migrate, type MigrationDb } from './migrations';

export const USER_DB_NAME = 'user.db';

/** Подготовка базы при запуске приложения (передаётся в SQLiteProvider). */
export async function initUserDb(db: MigrationDb): Promise<void> {
  await migrate(db);
}
