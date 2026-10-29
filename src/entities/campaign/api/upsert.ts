import type { SQLiteDatabase } from 'expo-sqlite';

/** Вставляет строку или обновляет её по ключевым колонкам. Колонки берутся из полей строки. */
export async function upsert(
  db: SQLiteDatabase,
  table: string,
  row: Record<string, string | number | null>,
  keys: string[],
): Promise<void> {
  const columns = Object.keys(row);
  const updates = columns.filter((column) => !keys.includes(column)).map((column) => `${column} = excluded.${column}`);
  await db.runAsync(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})
     ON CONFLICT(${keys.join(', ')}) DO UPDATE SET ${updates.join(', ')}`,
    columns.map((column) => row[column]),
  );
}
