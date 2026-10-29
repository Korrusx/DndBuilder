// Монеты копятся, пока игрок печатает, и записываются одной суммой: «4» → «45» даёт «Получено 45 зм».

import type { ChronicleEvent } from '@/entities/campaign';
import { COIN_ORDER } from '@/shared/content';
import type { Coins, PlayEvent } from '@/shared/lib/play-events';

import type { CoinBalance } from './types';

/** Прибавить изменение монет (событие добычи без предметов) к накопленной сумме со знаком. */
export function addToBalance(balance: CoinBalance, event: Extract<PlayEvent, { type: 'loot' }>): CoinBalance {
  const sign = event.direction === 'gain' ? 1 : -1;
  const next: CoinBalance = { ...balance };
  for (const coin of COIN_ORDER) {
    const value = (next[coin] ?? 0) + sign * (event.coins[coin] ?? 0);
    if (value) {
      next[coin] = value;
    } else {
      delete next[coin];
    }
  }
  return next;
}

/** Накопленная сумма → события «получено» и «потрачено» (пустая сумма — ничего). */
export function balanceEvents(balance: CoinBalance): ChronicleEvent[] {
  const gained: Coins = {};
  const spent: Coins = {};
  for (const coin of COIN_ORDER) {
    const value = balance[coin] ?? 0;
    if (value > 0) {
      gained[coin] = value;
    } else if (value < 0) {
      spent[coin] = -value;
    }
  }
  const events: ChronicleEvent[] = [];
  if (Object.keys(gained).length) {
    events.push({ type: 'loot', direction: 'gain', items: [], coins: gained });
  }
  if (Object.keys(spent).length) {
    events.push({ type: 'loot', direction: 'loss', items: [], coins: spent });
  }
  return events;
}

/** Событие только про монеты (его надо копить, а не писать сразу). */
export const isCoinsOnly = (event: PlayEvent): event is Extract<PlayEvent, { type: 'loot' }> =>
  event.type === 'loot' && event.items.length === 0;
