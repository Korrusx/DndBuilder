import type { Coin } from '@/shared/content';
import { COIN_ORDER } from '@/shared/content';

/** Монета счётчика квеста; своя единица («голов») к кошельку не привязывается — считаем в золотых. */
export const walletCoin = (unit: string): Coin => (COIN_ORDER.includes(unit as Coin) ? (unit as Coin) : 'gp');
