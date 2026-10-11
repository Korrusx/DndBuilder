// Краткая сводка персонажа для карточки в списке «Мои персонажи».

import type { Content, LocalizedText } from '@/content/types';
import { totalLevel, type Character } from './character';
import { computeSheet } from './sheet';

export type CharacterSummary = {
  /** Буква для аватара. */
  letter: string;
  level: number;
  classNames: LocalizedText[];
  species?: LocalizedText;
  background?: LocalizedText;
  /** Хиты и КЗ — только для готового персонажа, у черновика их ещё нельзя посчитать. */
  hp?: { current: number; max: number };
  armorClass?: number;
};

export function characterSummary(c: Character, content: Content): CharacterSummary {
  const summary: CharacterSummary = {
    letter: (c.name.trim()[0] ?? '?').toUpperCase(),
    level: totalLevel(c.classes),
    classNames: c.classes.flatMap((e) => content.classes.find((x) => x.id === e.classId)?.name ?? []),
    species: content.species.find((x) => x.id === c.speciesId)?.name,
    background: content.backgrounds.find((x) => x.id === c.backgroundId)?.name,
  };
  if (c.status.kind !== 'ready') return summary;
  try {
    const sheet = computeSheet(c, content);
    summary.hp = { current: Math.min(c.state.currentHp, sheet.maxHp), max: sheet.maxHp };
    summary.armorClass = sheet.armorClass;
  } catch {
    // Персонаж ссылается на то, чего нет в справочнике: показываем карточку без чисел.
  }
  return summary;
}

/** Доля оставшихся хитов → цвет полосы: >50% хорошо, >25% внимание, иначе опасно. */
export function hpLevel(current: number, max: number): 'good' | 'warn' | 'danger' {
  const share = max > 0 ? current / max : 0;
  if (share > 0.5) return 'good';
  if (share > 0.25) return 'warn';
  return 'danger';
}
