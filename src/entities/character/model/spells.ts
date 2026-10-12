import type { CharacterClass, Spell } from '@/shared/content';

import type { ClassEntry } from './types';

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

/** Пороги уровня персонажа, на которых растёт урон заговоров (SRD 5.2: «Cantrip Upgrade»). */
const CANTRIP_TIERS = [1, 5, 11, 17];

/**
 * Урон заклинания: кости для круга ячейки (заговор — для уровня персонажа).
 * `beams` — сколько лучей у «Мистического заряда» (каждый — отдельная атака с этими костями).
 * null — у заклинания нет урона в справочнике или нет данных для этого круга.
 */
export function spellDamage(spell: Spell, characterLevel: number, slotLevel = spell.level): { dice: string; beams?: number } | null {
  const d = spell.damage;
  if (!d) return null;
  if (spell.level === 0) {
    const tier = CANTRIP_TIERS.filter((l) => l <= characterLevel).length;
    if (d.beams) return d.bySlotLevel?.['0'] ? { dice: d.bySlotLevel['0'], beams: tier } : null;
    const key = String(CANTRIP_TIERS[tier - 1]);
    const dice = d.byCharacterLevel?.[key] ?? d.bySlotLevel?.['0'];
    return dice ? { dice } : null;
  }
  const dice = d.bySlotLevel?.[String(slotLevel)];
  return dice ? { dice } : null;
}

/** Круги, для которых известен урон заклинания: от его круга до `maxSlot`. */
export function spellDamageLevels(spell: Spell, maxSlot: number): number[] {
  if (!spell.damage?.bySlotLevel || spell.level === 0) return [];
  return Object.keys(spell.damage.bySlotLevel)
    .map(Number)
    .filter((l) => l >= spell.level && l <= Math.max(spell.level, maxSlot))
    .sort((a, b) => a - b);
}
