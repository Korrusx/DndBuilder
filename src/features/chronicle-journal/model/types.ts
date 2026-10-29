import type { Coin } from '@/shared/content';

/** Сумма монет со знаком: + получено, − потрачено. */
export type CoinBalance = Partial<Record<Coin, number>>;
