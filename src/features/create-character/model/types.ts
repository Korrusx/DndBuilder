
// ---------- Проверка ----------

export type Issue = {
  step: number;
  message: string;
  /** false — предупреждение, персонажа всё равно можно сохранить. */
  blocking: boolean;
};
