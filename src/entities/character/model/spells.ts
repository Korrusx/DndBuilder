import type { CharacterClass } from '@/shared/content/types';
import type { ClassEntry } from './character';

/** СЛ спасброска от заклинаний = 8 + мод + БМ. */
export function spellSaveDC(mod: number, profBonus: number): number {
  return 8 + mod + profBonus;
}

/** Бонус атаки заклинанием = мод + БМ. */
export function spellAttackBonus(mod: number, profBonus: number): number {
  return mod + profBonus;
}

/** Максимум ячеек по кругам 1–9 из таблицы уровней класса. */
export function spellSlots(cls: CharacterClass, level: number): number[] {
  return cls.levels[level - 1]?.spellcasting?.slots ?? [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

/**
 * Ячейки персонажа. Для одного класса — из таблицы класса.
 * TODO(мультикласс): у мультиклассового заклинателя ячейки считаются по общей таблице
 * с учётом «половинных» и «третьих» заклинателей, а ячейки колдуна идут отдельно. Сделать вместе с мультиклассом.
 */
export function characterSpellSlots(entries: ClassEntry[], classes: ReadonlyMap<string, CharacterClass>): number[] {
  const first = entries[0];
  const cls = first && classes.get(first.classId);
  return cls ? spellSlots(cls, first.level) : [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

/** Число подготовленных заклинаний и заговоров на уровне. */
export function spellsKnown(cls: CharacterClass, level: number): { cantrips: number; prepared: number } {
  const sc = cls.levels[level - 1]?.spellcasting;
  return { cantrips: sc?.cantrips ?? 0, prepared: sc?.prepared ?? 0 };
}
