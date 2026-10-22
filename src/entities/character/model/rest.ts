// Состояние игры: урон, лечение, временные хиты, отдых.

import type { Edition } from '@/shared/content';

import type { GameState } from './types';

/**
 * Урон снимается сначала с временных хитов, потом с текущих (не ниже 0).
 * Если передан `maxHp`, учитываются правила смерти SRD 5.2:
 * - урон на 0 хитов — провал спасброска от смерти (критическое попадание — два);
 * - если после падения до 0 остаток урона не меньше максимума хитов — мгновенная смерть (3 провала).
 */
export function applyDamage(state: GameState, amount: number, maxHp?: number, critical = false): GameState {
  if (amount <= 0) {
    return state;
  }
  const fromTemp = Math.min(state.tempHp, amount);
  const rest = amount - fromTemp;
  const next = { ...state, tempHp: state.tempHp - fromTemp, currentHp: Math.max(0, state.currentHp - rest) };
  if (maxHp === undefined || rest === 0) {
    return next;
  }
  const failures = state.deathSaves.failures;
  if (state.currentHp === 0) {
    return { ...next, deathSaves: { ...state.deathSaves, failures: Math.min(3, failures + (critical ? 2 : 1)) } };
  }
  if (rest - state.currentHp >= maxHp) {
    return { ...next, deathSaves: { ...state.deathSaves, failures: 3 } };
  }
  return next;
}

/** Лечение не поднимает выше максимума. Если персонаж был на 0, спасброски от смерти сбрасываются. */
export function applyHealing(state: GameState, amount: number, maxHp: number): GameState {
  const currentHp = Math.min(maxHp, state.currentHp + amount);
  const deathSaves = currentHp > 0 ? { successes: 0, failures: 0 } : state.deathSaves;
  return { ...state, currentHp, deathSaves };
}

/** Временные хиты не складываются: остаётся большее значение. */
export function setTempHp(state: GameState, amount: number): GameState {
  return { ...state, tempHp: Math.max(state.tempHp, amount) };
}

/**
 * Короткий отдых: потратить одну кость хитов класса `classId`.
 * `roll` — выпавшее значение кости; восстанавливается roll + мод. ТЕЛ (минимум 1).
 */
export function spendHitDie(
  state: GameState,
  classId: string,
  available: number,
  roll: number,
  conMod: number,
  maxHp: number,
): GameState {
  const spent = state.hitDiceSpent[classId] ?? 0;
  if (spent >= available) {
    return state;
  }
  const healed = applyHealing(state, Math.max(1, roll + conMod), maxHp);
  return { ...healed, hitDiceSpent: { ...state.hitDiceSpent, [classId]: spent + 1 } };
}

/**
 * Долгий отдых: все хиты, все ячейки и ресурсы умений, −1 уровень истощения.
 * Кости хитов: SRD 5.2 — все; SRD 5.1 (2014) — половина общего числа (не меньше одной). Какие кости вернуть,
 * выбирает игрок; приложение возвращает сначала самые крупные (`hitDice` — кости по классам, как в листе).
 */
export function longRest(
  state: GameState,
  maxHp: number,
  edition: Edition = '2024',
  hitDice: { classId: string; die: number; total: number }[] = [],
): GameState {
  return {
    ...state,
    currentHp: maxHp,
    tempHp: 0,
    hitDiceSpent: edition === '2014' ? recoverHalfHitDice(state.hitDiceSpent, hitDice) : {},
    slotsSpent: state.slotsSpent.map(() => 0),
    resourcesSpent: {},
    deathSaves: { successes: 0, failures: 0 },
    exhaustion: Math.max(0, state.exhaustion - 1),
    raging: false,
    pactSlotsSpent: undefined,
  };
}

/** 2014: вернуть половину костей хитов (от общего числа, не меньше одной), начиная с самых крупных. */
function recoverHalfHitDice(
  spent: Record<string, number>,
  hitDice: { classId: string; die: number; total: number }[],
): Record<string, number> {
  const total = hitDice.reduce((s, h) => s + h.total, 0);
  let left = Math.max(1, Math.floor(total / 2));
  const out = { ...spent };
  for (const h of [...hitDice].sort((a, b) => b.die - a.die)) {
    const back = Math.min(left, out[h.classId] ?? 0);
    out[h.classId] = (out[h.classId] ?? 0) - back;
    left -= back;
  }
  return Object.fromEntries(Object.entries(out).filter(([, n]) => n > 0));
}
