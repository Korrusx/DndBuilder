// Хиты за новый уровень с разбором: кость (бросок / среднее / свой кубик) + ТЕЛ + бонусы за уровень
// + пересчёт за прошлые уровни, если ТЕЛ выросло. Чистые функции.

import { averageHitDie } from '@/entities/character';

import type { HpBreakdownPart, HpMethod, HpResult, SheetDiff } from '../types';

export type HpGainInput = {
  die: number;
  method: HpMethod;
  /** Выпавшее или введённое число (для `roll` и `manual`). */
  rolled?: number;
  /** Модификатор ТЕЛ после повышения. */
  conMod: number;
  /** Прибавки за уровень от умений (дварфийская стойкость, «Крепкий», драконья устойчивость). */
  perLevelBonuses: { sourceId: string; value: number }[];
  /** На сколько вырос модификатор ТЕЛ на этом уровне. */
  retroactiveConDelta: number;
  /** Сколько уровней было до повышения (за них пересчитывается ТЕЛ). */
  levelsBefore: number;
};

/** Значение кости хитов для способа: среднее (как в правилах приложения) или выпавшее, в пределах 1…кость. */
export function hitDieValue(die: number, method: HpMethod, rolled?: number): number {
  if (method === 'average' || rolled === undefined) {
    return averageHitDie(die);
  }
  return Math.min(die, Math.max(1, Math.round(rolled)));
}

/**
 * Хиты нового уровня. Минимума за уровень в правилах приложения нет (только максимум хитов не меньше 1),
 * поэтому прибавка может быть и меньше единицы при отрицательной ТЕЛ.
 * TODO(правила): нужен ли минимум +1 хит за уровень — уточнить.
 */
export function hpGain(input: HpGainInput): HpResult {
  const value = hitDieValue(input.die, input.method, input.rolled);
  const breakdown: HpBreakdownPart[] = [
    { kind: 'die', method: input.rolled === undefined ? 'average' : input.method, die: input.die, value },
    { kind: 'con', value: input.conMod },
    ...input.perLevelBonuses.map((b) => ({ kind: 'bonus' as const, sourceId: b.sourceId, value: b.value })),
  ];
  if (input.retroactiveConDelta && input.levelsBefore) {
    breakdown.push({
      kind: 'retroCon',
      perLevel: input.retroactiveConDelta,
      levels: input.levelsBefore,
      value: input.retroactiveConDelta * input.levelsBefore,
    });
  }
  return { gain: breakdown.reduce((sum, part) => sum + part.value, 0), breakdown };
}

/**
 * Хиты уровня по разнице листов. `maxDelta` — насколько вырос максимум хитов листа (он считается по среднему):
 * если разбор со средним не сходится с ним (эффекты предметов, истощение 2014), остаток — отдельной строкой.
 */
export function hpGainFromDiff(diff: SheetDiff, die: number, method: HpMethod, rolled?: number): HpResult {
  const input: HpGainInput = {
    die,
    method,
    rolled,
    conMod: diff.conMod.after,
    perLevelBonuses: diff.hpBonuses,
    retroactiveConDelta: diff.conMod.after - diff.conMod.before,
    levelsBefore: diff.level.before,
  };
  const result = hpGain(input);
  const maxChange = diff.numbers.find((n) => n.key === 'maxHp');
  const maxDelta = maxChange ? Number(maxChange.after) - Number(maxChange.before) : 0;
  const average = hpGain({ ...input, method: 'average', rolled: undefined }).gain;
  const rest = maxDelta - average;
  if (rest === 0) {
    return result;
  }
  return { gain: result.gain + rest, breakdown: [...result.breakdown, { kind: 'other', value: rest }] };
}
