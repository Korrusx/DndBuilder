// Хиты за новый уровень с разбором: кость (бросок / среднее / свой кубик) + ТЕЛ + бонусы за уровень
// + пересчёт за прошлые уровни, если ТЕЛ выросло. Чистые функции.

import type { HpMethod } from '@/entities/character';
import { averageHitDie, levelHitPoints } from '@/entities/character';

import type { HpBreakdownPart, HpResult, SheetDiff } from '../types';

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

/** Хиты нового уровня: кость + ТЕЛ (не меньше 1 за уровень) + бонусы + пересчёт ТЕЛ за прошлые уровни. */
export function hpGain(input: HpGainInput): HpResult {
  const value = hitDieValue(input.die, input.method, input.rolled);
  const method = input.rolled === undefined ? 'average' : input.method;
  const breakdown: HpBreakdownPart[] = [
    { kind: 'die', method, die: input.die, value },
    { kind: 'con', value: input.conMod },
  ];
  // Уровень даёт не меньше 1 хита: при отрицательной ТЕЛ — добавка до единицы.
  const floor = levelHitPoints(value, input.conMod) - (value + input.conMod);
  if (floor) {
    breakdown.push({ kind: 'minimum', value: floor });
  }
  breakdown.push(
    ...input.perLevelBonuses.map((b) => ({ kind: 'bonus' as const, sourceId: b.sourceId, value: b.value })),
  );
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
 * Хиты уровня по разнице листов. Черновик уже содержит закреплённый бросок (`hpRolls`), поэтому максимум хитов
 * листа вырос ровно на прибавку. Если разбор с ним не сходится (эффекты предметов, истощение 2014, минимум
 * хита на прошлых уровнях при росте ТЕЛ), остаток — отдельной строкой.
 */
export function hpGainFromDiff(diff: SheetDiff, die: number, method: HpMethod, rolled?: number): HpResult {
  const result = hpGain({
    die,
    method,
    rolled,
    conMod: diff.conMod.after,
    perLevelBonuses: diff.hpBonuses,
    retroactiveConDelta: diff.conMod.after - diff.conMod.before,
    levelsBefore: diff.level.before,
  });
  const maxChange = diff.numbers.find((n) => n.key === 'maxHp');
  const maxDelta = maxChange ? Number(maxChange.after) - Number(maxChange.before) : 0;
  const rest = maxDelta - result.gain;
  if (rest === 0) {
    return result;
  }
  return { gain: maxDelta, breakdown: [...result.breakdown, { kind: 'other', value: rest }] };
}
