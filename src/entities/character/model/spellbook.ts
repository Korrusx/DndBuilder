// Книга заклинаний волшебника (SRD 5.2): в ней заклинания 1+ круга, которые волшебник знает.
// Подготовить можно только заклинания из книги; ритуалы из книги можно творить, не готовя их.

import type { Content } from '@/shared/content';
import { indexOf } from '@/shared/content';

import { CHOICE_KEYS, SPELLBOOK_PER_LEVEL, SPELLBOOK_START } from '../config/constants';
import { spellLimits, spellOptions } from './build';
import type { Character } from './types';

const wizardLevel = (c: Character) => c.classes.find((e) => e.classId === 'wizard')?.level ?? 0;

/** Есть ли у персонажа книга заклинаний (волшебник). */
export function hasSpellbook(c: Character): boolean {
  return wizardLevel(c) > 0;
}

/**
 * Заклинания в книге. Если книги ещё нет (персонаж создан до её появления в приложении),
 * в ней считаются подготовленные заклинания.
 */
export function spellbook(c: Character): string[] {
  if (!hasSpellbook(c)) return [];
  return c.choices[CHOICE_KEYS.spellbook] ?? c.preparedSpells;
}

/** Сколько заклинаний должно быть в книге как минимум: 6 на 1-м уровне и по 2 за каждый следующий. */
export function spellbookMinimum(c: Character): number {
  const level = wizardLevel(c);
  return level ? SPELLBOOK_START + SPELLBOOK_PER_LEVEL * (level - 1) : 0;
}

/** Что можно вписать в книгу: заклинания волшебника тех кругов, для которых есть ячейки. */
export function spellbookOptions(c: Character, content: Content, circle: number): string[] {
  const max = spellLimits(c, content)?.maxSpellLevel ?? 1;
  return circle <= max ? spellOptions('wizard', circle, content) : [];
}

/** Из чего можно готовить заклинания этого круга: у волшебника — из книги, у других — весь список класса. */
export function preparableSpells(c: Character, content: Content, classId: string, circle: number): string[] {
  if (classId !== 'wizard') return spellOptions(classId, circle, content);
  const spells = indexOf(content).spells;
  return spellbook(c).filter((id) => spells.get(id)?.level === circle);
}

/** Записать книгу; подготовленные заклинания, которых в ней больше нет, снимаются. */
export function setSpellbook(c: Character, ids: string[]): Character {
  const book = new Set(ids);
  return {
    ...c,
    choices: { ...c.choices, [CHOICE_KEYS.spellbook]: ids },
    preparedSpells: c.preparedSpells.filter((id) => book.has(id)),
  };
}
