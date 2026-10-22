export type MetaKey = 'lastBackupAt' | 'language' | 'diceSettings';

// Миграции пользовательской базы. Версия схемы хранится в PRAGMA user_version.
// Новую миграцию добавляй в конец списка; уже выпущенные миграции не меняй.

/** Минимум от базы, который нужен миграциям (так их можно проверить в тестах без SQLite). */
export type MigrationDb = {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};

// Миграции пользовательской базы. Версия схемы хранится в PRAGMA user_version.
// Новую миграцию добавляй в конец списка; уже выпущенные миграции не меняй.
export type Migration = { version: number; up: (db: MigrationDb) => Promise<void> };
