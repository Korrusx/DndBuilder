// Пользовательская база (персонажи). Справочник хранится отдельно — см. src/content.
export * from '@/entities/character';
export * from './meta';
export * from './migrations';

import { migrate } from './migrations';
import type { MigrationDb } from './types';

/** Подготовка базы при запуске приложения (передаётся в SQLiteProvider). */
export async function initUserDb(db: MigrationDb): Promise<void> {
  await migrate(db);
}
