import { migrate } from '../migrations';
import type { Migration, MigrationDb } from '../types';

/** Поддельная база: запоминает выполненный SQL и версию схемы. */
function fakeDb(version = 0) {
  const executed: string[] = [];
  const db: MigrationDb & { executed: string[]; version: () => number } = {
    executed,
    version: () => version,
    async execAsync(sql) {
      const m = sql.match(/PRAGMA user_version = (\d+)/);
      if (m) {
        version = Number(m[1]);
      } else {
        executed.push(sql.trim());
      }
    },
    async getFirstAsync<T>() {
      return { user_version: version } as T;
    },
    async withTransactionAsync(task) {
      await task();
    },
  };
  return db;
}

const steps: Migration[] = [
  { version: 1, up: async (db) => db.execAsync('one') },
  { version: 2, up: async (db) => db.execAsync('two') },
];

describe('миграции', () => {
  test('новая база проходит все миграции по порядку', async () => {
    const db = fakeDb();
    expect(await migrate(db, steps)).toBe(2);
    expect(db.executed).toEqual(['PRAGMA journal_mode = WAL;', 'one', 'two']);
  });

  test('применяются только новые миграции', async () => {
    const db = fakeDb(1);
    expect(await migrate(db, steps)).toBe(2);
    expect(db.executed).toEqual(['PRAGMA journal_mode = WAL;', 'two']);
  });

  test('актуальная база не меняется', async () => {
    const db = fakeDb(2);
    await migrate(db, steps);
    expect(db.executed).toEqual(['PRAGMA journal_mode = WAL;']);
  });
});
