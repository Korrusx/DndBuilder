// Заклинания от особенностей вида (SRD 5.2): родословные эльфа и гнома, наследие тифлинга, «Несущий свет» аасимара.
// Заговоры известны всегда; заклинания 1+ круга всегда подготовлены, творятся без ячейки (обычно раз до долгого
// отдыха) или ячейкой, если они есть.

import type { AbilityId, Content } from '@/shared/content';
import { indexOf } from '@/shared/content';

import {
  CHOICE_KEYS,
  SPECIES_CANTRIP_SWAP,
  SPECIES_SPELL_ABILITY_TRAITS,
  SPECIES_SPELL_FIXED_ABILITY,
  SPECIES_SPELL_FREE_USES,
} from '../config/constants';
import { choice1 } from './choices';
import { computeSheet } from './sheet';
import { spellAttackBonus, spellSaveDC } from './spells';
import type { Character, CharacterSheet } from './types';

export type SpeciesSpell = {
  traitId: string;
  spellId: string;
  /** Круг заклинания; 0 — заговор. */
  level: number;
  /** Сколько раз можно сотворить без ячейки до долгого отдыха (у заговоров 0). */
  freeUses: number;
  /** Ключ в `state.resourcesSpent` для бесплатных использований. */
  resourceKey: string;
  /** Список класса, из которого заговор можно заменить (высший эльф: волшебник). */
  swapList?: string;
};

export type SpeciesSpellcasting = {
  ability?: AbilityId;
  saveDC?: number;
  attackBonus?: number;
  spells: SpeciesSpell[];
};

/** Нужно ли выбрать заклинательную характеристику для заклинаний вида. */
export function needsSpeciesSpellAbility(c: Character, content: Content): boolean {
  const species = indexOf(content).species.get(c.speciesId);
  return !!species?.traits.some((id) => SPECIES_SPELL_ABILITY_TRAITS.includes(id));
}

/** Заклинания вида на текущем уровне персонажа; null — их нет. */
export function speciesSpellcasting(
  c: Character,
  content: Content,
  sheet: CharacterSheet = computeSheet(c, content),
): SpeciesSpellcasting | null {
  const idx = indexOf(content);
  const spells: SpeciesSpell[] = [];
  let fixedAbility: AbilityId | undefined;
  for (const f of sheet.features) {
    if (f.source !== 'species') continue;
    const trait = idx.traits.get(f.id);
    if (!trait?.spells) continue;
    fixedAbility ??= SPECIES_SPELL_FIXED_ABILITY[trait.id];
    for (const original of trait.spells) {
      const swapList = SPECIES_CANTRIP_SWAP[trait.id];
      const spellId = (swapList && choice1(c, CHOICE_KEYS.speciesCantrip(trait.id))) || original;
      const level = idx.spells.get(spellId)?.level ?? 0;
      if (spells.some((s) => s.spellId === spellId)) continue;
      spells.push({
        traitId: trait.id,
        spellId,
        level,
        freeUses: level === 0 ? 0 : SPECIES_SPELL_FREE_USES[trait.id] === 'pb' ? sheet.profBonus : 1,
        resourceKey: `species-spell.${spellId}`,
        ...(swapList ? { swapList } : {}),
      });
    }
  }
  if (!spells.length) return null;
  const ability = fixedAbility ?? (choice1(c, CHOICE_KEYS.speciesSpellAbility) as AbilityId | undefined);
  const mod = ability ? sheet.abilities[ability].mod : undefined;
  return {
    ability,
    ...(mod === undefined ? {} : { saveDC: spellSaveDC(mod, sheet.profBonus), attackBonus: spellAttackBonus(mod, sheet.profBonus) }),
    spells: spells.sort((a, b) => a.level - b.level),
  };
}
