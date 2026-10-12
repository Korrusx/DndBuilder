// Ключи выборов мастера создания (поле `choices` персонажа) и правила, которые из них следуют.
// В справочнике эти варианты описаны только текстом, поэтому таблицы ниже — по тексту SRD 5.2.

import { CHOICE_KEYS, FEATURE_OPTIONS } from '../config/constants';
import type { Character, Effect } from './types';

/** Значение выбора с одним вариантом. */
export function choice1(c: Character, key: string): string | undefined {
  return c.choices[key]?.[0];
}

/** Все владения, выбранные в мастере (значения ключей `….prof…`). */
export function chosenProficiencyIds(c: Character): string[] {
  return Object.entries(c.choices)
    .filter(([key]) => /(^|\.)prof(\.\d+)?$/.test(key))
    .flatMap(([, ids]) => ids);
}

/** Владения от выбранных вариантов умений. */
/** Эффекты выбранных вариантов умений («Чудотворец»: бонус МДР к Магии и Религии). */
export function featureOptionEffects(c: Character): Effect[] {
  return Object.entries(FEATURE_OPTIONS).flatMap(([featureId, options]) => {
    const chosen = choice1(c, CHOICE_KEYS.featureOption(featureId));
    return options.find((o) => o.id === chosen)?.effects ?? [];
  });
}

export function featureOptionProficiencies(c: Character): string[] {
  return Object.entries(FEATURE_OPTIONS).flatMap(([featureId, options]) => {
    const chosen = choice1(c, CHOICE_KEYS.featureOption(featureId));
    return options.find((o) => o.id === chosen)?.proficiencies ?? [];
  });
}
