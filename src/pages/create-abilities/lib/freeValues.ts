import { ABILITY_IDS } from '@/entities/character/config/constants';
import type { AbilityScores } from '@/entities/character/model/types';

/** Значения пула, ещё не назначенные характеристикам (с учётом повторов). */
export function freeValues(pool: number[], base: AbilityScores): number[] {
  const free = [...pool];
  for (const id of ABILITY_IDS) {
    const i = free.indexOf(base[id]);
    if (base[id] && i >= 0) free.splice(i, 1);
  }
  return free.sort((a, b) => b - a);
}
