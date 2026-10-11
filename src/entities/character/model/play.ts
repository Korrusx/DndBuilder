// Режим игры: спасброски от смерти, истощение, ячейки, сотворение заклинаний, броски урона, вещи.

import type { Content } from '@/shared/content/types';
import { parseDice, rollDie } from '@/shared/lib/dice/dice';
import { CUSTOM_ITEM_PREFIX, EXHAUSTION_MAX } from '../config/constants';
import type { DamageRoll, DeathStatus, GameState, InventoryItem } from './types';

// ---------- Истощение (SRD 5.2) ----------

/** Каждый уровень истощения: −2 к броскам к20 (проверки, атаки, спасброски). */
export function exhaustionPenalty(exhaustion: number): number {
  return -2 * exhaustion;
}

/** Каждый уровень истощения: скорость −5 фт. */
export function speedWithExhaustion(speed: number, exhaustion: number): number {
  return Math.max(0, speed - 5 * exhaustion);
}

export function setExhaustion(state: GameState, level: number): GameState {
  return { ...state, exhaustion: Math.max(0, Math.min(EXHAUSTION_MAX, level)) };
}

// ---------- Состояния ----------

export function toggleCondition(state: GameState, conditionId: string): GameState {
  const has = state.conditions.includes(conditionId);
  return { ...state, conditions: has ? state.conditions.filter((c) => c !== conditionId) : [...state.conditions, conditionId] };
}

// ---------- Спасброски от смерти ----------

export function deathStatus(state: GameState): DeathStatus {
  if (state.deathSaves.failures >= 3) return 'dead';
  if (state.currentHp > 0) return 'alive';
  if (state.deathSaves.successes >= 3) return 'stable';
  return 'dying';
}

/**
 * Спасбросок от смерти: итог 10+ — успех, меньше — провал; естественная 1 — два провала;
 * естественная 20 — персонаж приходит в себя с 1 хитом. 3 успеха — стабилен, 3 провала — смерть.
 * `total` — итог с модификаторами (например, штраф истощения), по умолчанию равен выпавшему.
 */
export function deathSave(state: GameState, natural: number, total = natural): GameState {
  if (deathStatus(state) !== 'dying') return state;
  if (natural === 20) return { ...state, currentHp: 1, deathSaves: { successes: 0, failures: 0 } };
  const { successes, failures } = state.deathSaves;
  if (natural === 1) return { ...state, deathSaves: { successes, failures: Math.min(3, failures + 2) } };
  if (total >= 10) return { ...state, deathSaves: { successes: successes + 1, failures } };
  return { ...state, deathSaves: { successes, failures: failures + 1 } };
}

// ---------- Ячейки и заклинания ----------

/** Потратить (+1) или вернуть (−1) ячейку круга `level` (1–9). */
export function adjustSlot(state: GameState, level: number, delta: number, slots: number[]): GameState {
  const i = level - 1;
  const max = slots[i] ?? 0;
  const slotsSpent = [...state.slotsSpent];
  slotsSpent[i] = Math.max(0, Math.min(max, (slotsSpent[i] ?? 0) + delta));
  return { ...state, slotsSpent };
}

/** Самый низкий круг ≥ `spellLevel` со свободной ячейкой, или null. */
export function lowestFreeSlot(state: GameState, spellLevel: number, slots: number[]): number | null {
  for (let level = Math.max(1, spellLevel); level <= slots.length; level++) {
    if ((state.slotsSpent[level - 1] ?? 0) < (slots[level - 1] ?? 0)) return level;
  }
  return null;
}

/**
 * Сотворить заклинание: заговор ячейку не тратит; иначе тратится ячейка указанного круга
 * (по умолчанию — самая низкая подходящая). null — свободных ячеек нет.
 */
export function castSpell(
  state: GameState,
  spellLevel: number,
  slots: number[],
  slotLevel?: number,
): { state: GameState; slotLevel: number } | null {
  if (spellLevel === 0) return { state, slotLevel: 0 };
  const level = slotLevel ?? lowestFreeSlot(state, spellLevel, slots);
  if (level === null || level < spellLevel) return null;
  if ((state.slotsSpent[level - 1] ?? 0) >= (slots[level - 1] ?? 0)) return null;
  return { state: adjustSlot(state, level, 1, slots), slotLevel: level };
}

/** Короткий отдых завершён: колдун восстанавливает ячейки «Магии договора». */
export function finishShortRest(state: GameState, pactMagic: boolean): GameState {
  return pactMagic ? { ...state, slotsSpent: state.slotsSpent.map(() => 0) } : state;
}

// ---------- Броски урона ----------

/** Бросок урона «1к6+3». При критическом попадании кости бросаются дважды. */
export function rollDamage(dice: string, bonus: number, critical = false, rng: () => number = Math.random): DamageRoll {
  const { count, sides } = parseDice(dice);
  const rolled = Array.from({ length: critical ? count * 2 : count }, () => rollDie(sides, rng));
  return { dice: rolled, sides, bonus, total: Math.max(0, rolled.reduce((s, d) => s + d, 0) + bonus) };
}

/** Безоружный удар: попадание СИЛ + БМ, урон 1 + СИЛ (дробящий). */
export function unarmedStrike(strMod: number, profBonus: number): { toHit: number; damage: number } {
  return { toHit: strMod + profBonus, damage: Math.max(0, 1 + strMod) };
}

// ---------- Вещи ----------

/**
 * Надеть/снять предмет. Доспех может быть надет только один, щит — один:
 * при надевании другой доспех (щит) снимается.
 */
export function toggleEquipped(items: InventoryItem[], index: number, content: Content): InventoryItem[] {
  const kind = (i: InventoryItem) => {
    const armor = content.equipment.find((e) => e.id === i.itemId)?.armor;
    return armor ? (armor.category === 'shield' ? 'shield' : 'armor') : 'other';
  };
  const target = items[index];
  if (!target) return items;
  const on = !target.equipped;
  const targetKind = kind(target);
  return items.map((item, i) => {
    if (i === index) return { ...item, equipped: on };
    if (on && targetKind !== 'other' && item.equipped && kind(item) === targetKind) return { ...item, equipped: false };
    return item;
  });
}

/** Добавляет предмет: если такой уже есть (и это не свой предмет), увеличивает количество. */
export function addToInventory(items: InventoryItem[], item: InventoryItem): InventoryItem[] {
  const i = items.findIndex((x) => x.itemId === item.itemId && !x.itemId.startsWith(CUSTOM_ITEM_PREFIX));
  if (i < 0) return [...items, item];
  return items.map((x, j) => (j === i ? { ...x, quantity: x.quantity + item.quantity } : x));
}
