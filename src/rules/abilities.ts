import type { AbilityId } from '@/content/types';
import { ABILITY_IDS, type AbilityScores } from './character';

export const ABILITY_MAX = 20;

/** Модификатор характеристики: floor((значение − 10) / 2). */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Бонус мастерства: ур. 1–4 → +2, 5–8 → +3, 9–12 → +4, 13–16 → +5, 17–20 → +6. */
export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 4);
}

export function modifiers(scores: AbilityScores): AbilityScores {
  const out = {} as AbilityScores;
  for (const id of ABILITY_IDS) out[id] = abilityModifier(scores[id]);
  return out;
}

/** Складывает базовые значения и все прибавки, не поднимая выше 20. */
export function applyIncreases(base: AbilityScores, ...increases: Partial<AbilityScores>[]): AbilityScores {
  const out = { ...base };
  for (const inc of increases) {
    for (const id of ABILITY_IDS) {
      const add = inc[id] ?? 0;
      if (add) out[id] = Math.min(ABILITY_MAX, out[id] + add);
    }
  }
  return out;
}

// --- Способы генерации характеристик ---

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;
const POINT_BUY_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

/** Стоимость значения при покупке очков; undefined — значение вне диапазона 8–15. */
export function pointBuyCost(score: number): number | undefined {
  return POINT_BUY_COST[score];
}

/** Сколько очков потрачено; undefined, если какое-то значение вне диапазона. */
export function pointBuySpent(scores: AbilityScores): number | undefined {
  let total = 0;
  for (const id of ABILITY_IDS) {
    const cost = pointBuyCost(scores[id]);
    if (cost === undefined) return undefined;
    total += cost;
  }
  return total;
}

/** Набор значений — перестановка стандартного набора. */
export function isStandardArray(scores: AbilityScores): boolean {
  const values = ABILITY_IDS.map((id) => scores[id]).sort((a, b) => b - a);
  return values.every((v, i) => v === STANDARD_ARRAY[i]);
}

export type AbilityRoll = { dice: number[]; droppedIndex: number; total: number };

/** Бросок 4к6, меньшая кость отбрасывается. `rng` возвращает число в [0, 1). */
export function roll4d6DropLowest(rng: () => number = Math.random): AbilityRoll {
  const dice = Array.from({ length: 4 }, () => 1 + Math.floor(rng() * 6));
  const droppedIndex = dice.indexOf(Math.min(...dice));
  const total = dice.reduce((s, d) => s + d, 0) - dice[droppedIndex];
  return { dice, droppedIndex, total };
}

// --- Бонусы предыстории ---

/**
 * Проверка распределения бонусов предыстории: +2/+1 или +1/+1/+1,
 * только к характеристикам, указанным в предыстории. Возвращает список ошибок (пустой — всё верно).
 */
export function validateBackgroundBonuses(
  bonuses: Partial<AbilityScores>,
  allowed: AbilityId[],
): string[] {
  const errors: string[] = [];
  const entries = ABILITY_IDS.map((id) => [id, bonuses[id] ?? 0] as const).filter(([, v]) => v !== 0);

  for (const [id] of entries) {
    if (!allowed.includes(id)) errors.push(`Бонус к ${id} не разрешён предысторией`);
  }
  const pattern = entries
    .map(([, v]) => v)
    .sort((a, b) => b - a)
    .join(',');
  if (pattern !== '2,1' && pattern !== '1,1,1') errors.push('Нужно распределить +2/+1 или +1/+1/+1');
  return errors;
}
