/// <reference types="node" />
// Настоящая SQLite для тестов (node:sqlite) с теми методами expo-sqlite, которыми пользуется приложение.

import type { SQLiteDatabase } from 'expo-sqlite';

import { migrate } from '../migrations';

type Param = string | number | null;

const flat = (params: unknown[]): Param[] =>
  (params.length === 1 && Array.isArray(params[0]) ? params[0] : params) as Param[];

/** База в памяти, уже прошедшая все миграции. */
export async function memoryDb(): Promise<SQLiteDatabase> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require('node:sqlite');
  const raw = new DatabaseSync(':memory:');
  const db = {
    async execAsync(source: string) {
      raw.exec(source);
    },
    async getFirstAsync<T>(source: string, ...params: unknown[]) {
      return (raw.prepare(source).get(...flat(params)) ?? null) as T | null;
    },
    async getAllAsync<T>(source: string, ...params: unknown[]) {
      return raw.prepare(source).all(...flat(params)) as T[];
    },
    async runAsync(source: string, ...params: unknown[]) {
      const result = raw.prepare(source).run(...flat(params));
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    async withTransactionAsync(task: () => Promise<void>) {
      raw.exec('BEGIN');
      try {
        await task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
  } as unknown as SQLiteDatabase;
  await migrate(db);
  return db;
}
