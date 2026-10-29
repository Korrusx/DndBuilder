import type { Coin } from './types';

/** Монеты от меньшей к большей. Сокращения и названия — coinAbbr / coinName (names.ts). */
export const COIN_ORDER: Coin[] = ['cp', 'sp', 'ep', 'gp', 'pp'];

/** Сколько медных в монете (SRD: 1 зм = 10 см = 100 мм, 1 пм = 10 зм, 1 эм = 5 см). */
export const COIN_VALUE: Record<Coin, number> = { cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000 };
