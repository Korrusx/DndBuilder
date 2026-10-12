import type { AbilityId } from '@/shared/content';

import type { FeatureOption, OriginFeatSlot } from '../model/types';

export const ABILITY_MAX = 20;

// --- Способы генерации характеристик ---

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export const POINT_BUY_BUDGET = 27;

export const POINT_BUY_MIN = 8;

export const POINT_BUY_MAX = 15;

export const POINT_BUY_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

export const ABILITY_IDS: AbilityId[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const CUSTOM_ITEM_PREFIX = 'custom:';

export const CHOICE_KEYS = {
  /** Владения на выбор из класса / предыстории / особенности вида (значения — id владений). */
  classProf: (classId: string, i: number) => `class.${classId}.prof.${i}`,
  backgroundProf: (backgroundId: string, i: number) => `background.${backgroundId}.prof.${i}`,
  traitProf: (traitId: string, i: number) => `trait.${traitId}.prof.${i}`,
  /** Черта «Одарённый»: три навыка или инструмента. */
  featProf: (slot: OriginFeatSlot) => `${slot}.prof`,
  /** Черта происхождения, выбранная по «Универсальности». */
  versatileFeat: 'versatile.feat',
  /** «Посвящённый в магию»: список заклинаний класса, характеристика, заговоры, заклинание 1-го круга. */
  featSpellList: (slot: OriginFeatSlot) => `${slot}.list`,
  featAbility: (slot: OriginFeatSlot) => `${slot}.ability`,
  featCantrips: (slot: OriginFeatSlot) => `${slot}.cantrips`,
  featSpell: (slot: OriginFeatSlot) => `${slot}.spell`,
  /** Вариант умения класса («Божественный порядок» и т.п.). */
  featureOption: (featureId: string) => `feature.${featureId}`,
  /** Языки на выбор от умения класса (плут: «Воровской жаргон»). */
  featureLanguages: (featureId: string) => `feature.${featureId}.languages`,
  /** Стартовое снаряжение: номер варианта (A = 0) и выбор предмета внутри набора. */
  equipment: (source: 'class' | 'background') => `equip.${source}`,
  equipmentPick: (source: 'class' | 'background', i: number) => `equip.${source}.pick.${i}`,
} as const;

/** Умения 1-го уровня с выбором одного из вариантов. */
export const FEATURE_OPTIONS: Record<string, FeatureOption[]> = {
  'cleric-divine-order': [
    {
      id: 'protector',
      name: { en: 'Protector', ru: 'Защитник' },
      description: { en: 'Proficiency with Martial weapons and Heavy armor.', ru: 'Владение воинским оружием и тяжёлыми доспехами.' },
      proficiencies: ['martial-weapons', 'heavy-armor'],
    },
    {
      id: 'thaumaturge',
      name: { en: 'Thaumaturge', ru: 'Чудотворец' },
      description: { en: 'One extra Cleric cantrip; WIS bonus to Arcana and Religion checks.', ru: 'Дополнительный заговор жреца; бонус МДР к проверкам Магии и Религии.' },
      extraCantrips: 1,
      // SRD 5.2: бонус к проверкам ИНТ (Магия или Религия), равный модификатору МДР (минимум +1).
      effects: [{ type: 'skillBonusFromAbility', skills: ['arcana', 'religion'], ability: 'wis', min: 1 }],
    },
  ],
  'druid-primal-order': [
    {
      id: 'magician',
      name: { en: 'Magician', ru: 'Волхв' },
      description: { en: 'One extra Druid cantrip; WIS bonus to Arcana and Nature checks.', ru: 'Дополнительный заговор друида; бонус МДР к проверкам Магии и Природы.' },
      extraCantrips: 1,
      // SRD 5.2: бонус к проверкам ИНТ (Магия или Природа), равный модификатору МДР (минимум +1).
      effects: [{ type: 'skillBonusFromAbility', skills: ['arcana', 'nature'], ability: 'wis', min: 1 }],
    },
    {
      id: 'warden',
      name: { en: 'Warden', ru: 'Страж' },
      description: { en: 'Proficiency with Martial weapons and Medium armor.', ru: 'Владение воинским оружием и средними доспехами.' },
      proficiencies: ['martial-weapons', 'medium-armor'],
    },
  ],
};

/** Умения, которые дают черту определённого типа (воин: «Боевой стиль»). */
export const FEAT_FEATURES: Record<string, 'fighting-style'> = {
  'fighter-fighting-style': 'fighting-style',
  'paladin-fighting-style': 'fighting-style',
  'ranger-fighting-style': 'fighting-style',
  'champion-additional-fighting-style': 'fighting-style',
};

/** Списки заклинаний для «Посвящённого в магию». */
export const MAGIC_INITIATE_LISTS = ['cleric', 'druid', 'wizard'] as const;

export const MAGIC_INITIATE_ABILITIES: AbilityId[] = ['int', 'wis', 'cha'];

/** Сколько стандартных языков выбирается при создании (кроме Общего). */
export const STANDARD_LANGUAGE_COUNT = 2;

/**
 * Языки от умений класса (SRD 5.2): `known` — даются сразу, `choose` — сколько ещё выбрать из любых
 * (стандартных и редких). Плут: «Воровской жаргон» и ещё один язык; друид: «Друидический».
 */
export const FEATURE_LANGUAGES: Record<string, { known: string[]; choose: number }> = {
  'rogue-thieves-cant': { known: ['thieves-cant'], choose: 1 },
  'druid-druidic': { known: ['druidic'], choose: 0 },
};

// ---------- Истощение (SRD 5.2) ----------

/** На 6-м уровне истощения персонаж умирает. */
export const EXHAUSTION_MAX = 6;
