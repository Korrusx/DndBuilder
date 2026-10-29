// События для летописи кампании, которые видно по разнице персонажа «до» и «после» изменения:
// 0 хитов, стабилизация, смерть, новый уровень, предметы, монеты. Броски и отдых сообщаются отдельно.

import { COIN_ORDER } from '@/shared/content';
import type { Coins, LootItem, PlayEvent } from '@/shared/lib/play-events';

import { totalLevel } from './character';
import { deathStatus } from './play';
import type { Character } from './types';

/** Сколько каждого предмета у персонажа: в рюкзаке и надето (перекладывание из рюкзака в слот — не находка). */
function itemCounts(character: Character): Map<string, LootItem> {
  const counts = new Map<string, LootItem>();
  const add = (itemId: string, quantity: number, name?: string) => {
    const known = counts.get(itemId);
    counts.set(itemId, { itemId, name: known?.name ?? name, quantity: (known?.quantity ?? 0) + quantity });
  };
  for (const item of character.equipment) {
    add(item.itemId, item.quantity, item.name);
  }
  for (const itemId of Object.values(character.equippedSlots)) {
    if (itemId) {
      add(itemId, 1);
    }
  }
  return counts;
}

function lootEvents(prev: Character, next: Character): PlayEvent[] {
  const before = itemCounts(prev);
  const after = itemCounts(next);
  const gained: LootItem[] = [];
  const lost: LootItem[] = [];
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const was = before.get(id);
    const now = after.get(id);
    const delta = (now?.quantity ?? 0) - (was?.quantity ?? 0);
    const name = now?.name ?? was?.name;
    const item = name ? { itemId: id, name } : { itemId: id };
    if (delta > 0) {
      gained.push({ ...item, quantity: delta });
    } else if (delta < 0) {
      lost.push({ ...item, quantity: -delta });
    }
  }
  const events: PlayEvent[] = [];
  if (gained.length) {
    events.push({ type: 'loot', direction: 'gain', items: gained, coins: {} });
  }
  if (lost.length) {
    events.push({ type: 'loot', direction: 'loss', items: lost, coins: {} });
  }
  const gainedCoins: Coins = {};
  const spentCoins: Coins = {};
  for (const coin of COIN_ORDER) {
    const delta = (next.coins[coin] ?? 0) - (prev.coins[coin] ?? 0);
    if (delta > 0) {
      gainedCoins[coin] = delta;
    } else if (delta < 0) {
      spentCoins[coin] = -delta;
    }
  }
  if (Object.keys(gainedCoins).length) {
    events.push({ type: 'loot', direction: 'gain', items: [], coins: gainedCoins });
  }
  if (Object.keys(spentCoins).length) {
    events.push({ type: 'loot', direction: 'loss', items: [], coins: spentCoins });
  }
  return events;
}

export function characterEvents(prev: Character, next: Character): PlayEvent[] {
  const events: PlayEvent[] = [];
  const wasStatus = deathStatus(prev.state);
  const status = deathStatus(next.state);
  if (prev.state.currentHp > 0 && next.state.currentHp <= 0 && status !== 'dead') {
    events.push({ type: 'down' });
  }
  if (status !== wasStatus && status === 'stable') {
    events.push({ type: 'stabilized' });
  }
  if (status !== wasStatus && status === 'dead') {
    events.push({ type: 'died' });
  }

  const level = totalLevel(next.classes);
  if (level > totalLevel(prev.classes)) {
    const grown = next.classes.find(
      (entry) => entry.level > (prev.classes.find((old) => old.classId === entry.classId)?.level ?? 0),
    );
    events.push(
      grown ? { type: 'level', level, classId: grown.classId, classLevel: grown.level } : { type: 'level', level },
    );
  }

  return [...events, ...lootEvents(prev, next)];
}
