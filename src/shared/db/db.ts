// Пользовательская база (персонажи). Справочник хранится отдельно — см. src/shared/content.

import { migrate } from './migrations';
import type { MigrationDb } from './types';

/** Подготовка базы при запуске приложения (передаётся в SQLiteProvider). */
export async function initUserDb(db: MigrationDb): Promise<void> {
  await migrate(db);
}
