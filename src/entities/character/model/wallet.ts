// Кошелёк персонажа: сколько в нём в пересчёте на одну монету и оплата с разменом.

import type { Coin } from '@/shared/content';
import { COIN_ORDER, COIN_VALUE } from '@/shared/content';

type Coins = Partial<Record<Coin, number>>;

const totalCp = (coins: Coins) => COIN_ORDER.reduce((sum, coin) => sum + (coins[coin] ?? 0) * COIN_VALUE[coin], 0);

/** Сколько всего в кошельке в монетах `unit` (с округлением вниз): 1 пм и 5 зм → 15 зм. */
export const walletValue = (coins: Coins, unit: Coin = 'gp') => Math.floor(totalCp(coins) / COIN_VALUE[unit]);

/** Сдача в медных — крупными монетами, кроме электрума и платины (их обычно не дают на сдачу). */
function changeCoins(cp: number): Coins {
  const change: Coins = {};
  let left = cp;
  for (const coin of ['gp', 'sp', 'cp'] as Coin[]) {
    const count = Math.floor(left / COIN_VALUE[coin]);
    if (count) {
      change[coin] = count;
      left -= count * COIN_VALUE[coin];
    }
  }
  return change;
}

/**
 * Заплатить `amount` монет `unit`. Сначала монетами того же вида, затем мелкими, а если не хватает —
 * разменивается крупная монета со сдачей. Null — в кошельке меньше, чем нужно (кошелёк не меняется).
 */
export function spendCoins(coins: Coins, amount: number, unit: Coin = 'gp'): Coins | null {
  let need = Math.floor(amount) * COIN_VALUE[unit];
  if (need <= 0) {
    return { ...coins };
  }
  if (totalCp(coins) < need) {
    return null;
  }
  const left: Record<Coin, number> = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  for (const coin of COIN_ORDER) {
    left[coin] = coins[coin] ?? 0;
  }
  // Ровно: та же монета, затем более мелкие от крупных к мелким.
  const exact = [unit, ...[...COIN_ORDER].reverse().filter((coin) => COIN_VALUE[coin] < COIN_VALUE[unit])];
  for (const coin of exact) {
    const take = Math.min(left[coin], Math.floor(need / COIN_VALUE[coin]));
    left[coin] -= take;
    need -= take * COIN_VALUE[coin];
  }
  // Остаток: по одной монете — самой мелкой из тех, что покрывают остаток, иначе самой крупной.
  while (need > 0) {
    const available = COIN_ORDER.filter((coin) => left[coin] > 0);
    const coin = available.find((other) => COIN_VALUE[other] >= need) ?? available[available.length - 1];
    left[coin] -= 1;
    need -= COIN_VALUE[coin];
  }
  const change = changeCoins(-need);
  const result: Coins = {};
  for (const coin of COIN_ORDER) {
    const value = left[coin] + (change[coin] ?? 0);
    if (value || coins[coin] !== undefined) {
      result[coin] = value;
    }
  }
  return result;
}
