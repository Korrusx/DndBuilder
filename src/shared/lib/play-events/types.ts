import type { Coin } from '@/shared/content';

export type LootItem = { itemId: string; name?: string; quantity: number };
export type Coins = Partial<Record<Coin, number>>;

/** Событие за игровым столом, которое может попасть в летопись кампании. */
export type PlayEvent =
  | { type: 'natural'; natural: 20 | 1; roll: string }
  | { type: 'down' }
  | { type: 'stabilized' }
  | { type: 'died' }
  /** `level` — общий уровень, `classLevel` — уровень класса, который вырос. */
  | { type: 'level'; level: number; classId?: string; classLevel?: number }
  /** Добыча (gain) или потеря (loss): предметы и монеты. Монеты — всегда положительные числа. */
  | { type: 'loot'; direction: 'gain' | 'loss'; items: LootItem[]; coins: Coins }
  | { type: 'rest'; rest: 'short' | 'long' }
  /** Итог боя. Точка подключения для режима «Мой ход» — пока его нет, никто это событие не шлёт. */
  | { type: 'combat'; rounds: number; dealt: number; taken: number };

/** Событие и чей это персонаж (нет — персонаж, открытый сейчас в режиме игры). */
export type PlayEventMessage = { characterId?: string; event: PlayEvent };

export type PlayEventListener = (message: PlayEventMessage) => void;
