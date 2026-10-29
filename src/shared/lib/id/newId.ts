/** Короткий уникальный id для записей пользовательской базы. */
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
