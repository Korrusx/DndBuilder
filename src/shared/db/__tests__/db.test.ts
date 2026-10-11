import { characterToRow, rowToCharacter } from '@/entities/character/api/serialize';
import { irmaLevel1 } from '@/entities/character/lib/samples';
import { newDraftCharacter } from '@/entities/character/model/character';
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
      if (m) version = Number(m[1]);
      else executed.push(sql.trim());
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

describe('сохранение персонажа', () => {
  test('туда и обратно без потерь', () => {
    const irma = irmaLevel1();
    const row = characterToRow(irma);
    expect(row).toMatchObject({ id: 'irma', name: 'Ирма Вейл', status: 'ready', draft_step: null });
    expect(rowToCharacter(row)).toEqual(irma);
  });

  test('номер шага черновика', () => {
    const draft = { ...newDraftCharacter('d', '2026-01-01T00:00:00.000Z'), status: { kind: 'draft', step: 3 } } as const;
    expect(characterToRow(draft)).toMatchObject({ status: 'draft', draft_step: 3 });
  });

  test('старый JSON без новых полей дополняется значениями по умолчанию', () => {
    const row = characterToRow(irmaLevel1());
    const old = JSON.parse(row.data);
    delete old.weaponMasteries;
    delete old.state.heroicInspiration;
    const c = rowToCharacter({ ...row, data: JSON.stringify(old) });
    expect(c.weaponMasteries).toEqual([]);
    expect(c.state.heroicInspiration).toBe(false);
    expect(c.name).toBe('Ирма Вейл');
  });
});
