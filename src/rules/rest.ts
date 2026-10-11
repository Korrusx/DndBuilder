// Состояние игры: урон, лечение, временные хиты, отдых.

import type { GameState } from './character';

/** Урон снимается сначала с временных хитов, потом с текущих (не ниже 0). */
export function applyDamage(state: GameState, amount: number): GameState {
  const fromTemp = Math.min(state.tempHp, amount);
  return {
    ...state,
    tempHp: state.tempHp - fromTemp,
    currentHp: Math.max(0, state.currentHp - (amount - fromTemp)),
  };
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
  if (spent >= available) return state;
  const healed = applyHealing(state, Math.max(1, roll + conMod), maxHp);
  return { ...healed, hitDiceSpent: { ...state.hitDiceSpent, [classId]: spent + 1 } };
}

/** Долгий отдых (SRD 5.2): все хиты, все кости хитов, все ячейки, −1 уровень истощения. */
export function longRest(state: GameState, maxHp: number): GameState {
  return {
    ...state,
    currentHp: maxHp,
    tempHp: 0,
    hitDiceSpent: {},
    slotsSpent: state.slotsSpent.map(() => 0),
    deathSaves: { successes: 0, failures: 0 },
    exhaustion: Math.max(0, state.exhaustion - 1),
  };
}
