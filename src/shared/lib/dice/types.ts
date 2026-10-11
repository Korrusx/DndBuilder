
// Кости: разбор записи «2d6», показ по-русски «2к6», броски.

export type DiceExpr = { count: number; sides: number };

export type D20Mode = 'normal' | 'advantage' | 'disadvantage';

export type D20Roll = {
  /** Обе кости при преимуществе/помехе, одна — при обычном броске. */
  dice: number[];
  /** Индекс кости, которая пошла в зачёт. */
  keptIndex: number;
  natural: number;
  total: number;
};
