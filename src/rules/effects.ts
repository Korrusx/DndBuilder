// Механические эффекты умений, особенностей вида и черт, которые влияют на расчёты.
// В справочнике эффекты описаны только текстом, поэтому здесь — таблица «id → эффект».
// Источник каждого эффекта — текст соответствующей записи SRD 5.2 (см. комментарии).

import type { AbilityId } from '@/content/types';

export type Effect =
  /** Черта «Бдительность»: к инициативе прибавляется бонус мастерства. */
  | { type: 'initiativeAddsProficiency' }
  /** Прибавка к максимуму хитов за каждый уровень персонажа. */
  | { type: 'hpPerLevel'; value: number }
  /** Прибавка к максимуму хитов, равная уровню класса, начиная с указанного уровня. */
  | { type: 'hpPerClassLevel'; classId: string; fromLevel: number }
  /** Защита без доспехов: 10 + модификаторы указанных характеристик. */
  | { type: 'unarmoredDefense'; abilities: AbilityId[]; shieldAllowed: boolean }
  /** +N к КЗ, пока надет доспех (лёгкий, средний или тяжёлый). */
  | { type: 'armoredAcBonus'; value: number }
  /** Прибавка к скорости без доспехов и щита (из столбца таблицы класса). */
  | { type: 'unarmoredSpeedFromClassTable'; classId: string; column: string };

export const EFFECTS: Record<string, Effect[]> = {
  // Черта «Бдительность» (Alert): Initiative Proficiency.
  alert: [{ type: 'initiativeAddsProficiency' }],
  // Черта стиля боя «Оборона» (Defense): +1 к КЗ в лёгком, среднем или тяжёлом доспехе.
  defense: [{ type: 'armoredAcBonus', value: 1 }],
  // Дварф, «Дварфийская стойкость»: +1 хит за каждый уровень.
  'dwarven-toughness': [{ type: 'hpPerLevel', value: 1 }],
  // Варвар, «Защита без доспехов»: 10 + ЛОВ + ТЕЛ, щит можно.
  'barbarian-unarmored-defense': [{ type: 'unarmoredDefense', abilities: ['dex', 'con'], shieldAllowed: true }],
  // Монах, «Защита без доспехов»: 10 + ЛОВ + МДР, без доспеха и щита.
  'monk-unarmored-defense': [{ type: 'unarmoredDefense', abilities: ['dex', 'wis'], shieldAllowed: false }],
  // Монах, «Движение без доспехов»: бонус скорости из таблицы класса.
  'monk-unarmored-movement': [
    { type: 'unarmoredSpeedFromClassTable', classId: 'monk', column: 'unarmored_movement_bonus' },
  ],
  // Чародей (Драконье чародейство), «Драконья устойчивость»: +3 хита на 3-м уровне и +1 за каждый
  // следующий уровень чародея (итого = уровню чародея); без доспеха КЗ 10 + ЛОВ + ХАР.
  'draconic-sorcery-draconic-resilience': [
    { type: 'hpPerClassLevel', classId: 'sorcerer', fromLevel: 3 },
    { type: 'unarmoredDefense', abilities: ['dex', 'cha'], shieldAllowed: true },
  ],
};

export function effectsOf(ids: Iterable<string>): Effect[] {
  const out: Effect[] = [];
  for (const id of ids) out.push(...(EFFECTS[id] ?? []));
  return out;
}
