import type { Migration, MigrationDb } from './types';

// Миграции пользовательской базы. Версия схемы хранится в PRAGMA user_version.
// Новую миграцию добавляй в конец списка; уже выпущенные миграции не меняй.
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      // Персонаж целиком (только выборы игрока и состояние игры) лежит в `data` как JSON.
      // Отдельные колонки — только то, что нужно для списка и сортировки.
      await db.execAsync(`
        CREATE TABLE characters (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          status TEXT NOT NULL,
          draft_step INTEGER,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX characters_updated_at ON characters (updated_at);
        CREATE TABLE meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
    },
  },
  {
    version: 2,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE homebrew_equipment (
          id TEXT PRIMARY KEY NOT NULL,
          name_ru TEXT NOT NULL,
          name_en TEXT NOT NULL DEFAULT '',
          description_ru TEXT NOT NULL DEFAULT '',
          weight REAL,
          cost_amount INTEGER NOT NULL DEFAULT 0,
          cost_unit TEXT NOT NULL DEFAULT 'gp',
          created_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

/** Применяет все миграции новее текущей версии базы, каждую в своей транзакции. */
export async function migrate(db: MigrationDb, migrations: Migration[] = MIGRATIONS): Promise<number> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let current = row?.user_version ?? 0;
  for (const m of migrations) {
    if (m.version <= current) continue;
    await db.withTransactionAsync(async () => {
      await m.up(db);
      await db.execAsync(`PRAGMA user_version = ${m.version};`);
    });
    current = m.version;
  }
  return current;
}
