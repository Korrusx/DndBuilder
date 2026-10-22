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
  /** Черта происхождения, выбранная по «Универсальности» (2014 — черта человека-варианта). */
  versatileFeat: 'versatile.feat',
  /** 2014: характеристика +1 от этой черты, если черта её даёт (`Feat.abilityIncrease`). */
  versatileAbility: 'versatile.ability',
  /** «Посвящённый в магию»: список заклинаний класса, характеристика, заговоры, заклинание 1-го круга. */
  featSpellList: (slot: OriginFeatSlot) => `${slot}.list`,
  featAbility: (slot: OriginFeatSlot) => `${slot}.ability`,
  featCantrips: (slot: OriginFeatSlot) => `${slot}.cantrips`,
  featSpell: (slot: OriginFeatSlot) => `${slot}.spell`,
  /** Вариант умения класса («Божественный порядок» и т.п.). */
  featureOption: (featureId: string) => `feature.${featureId}`,
  /** Языки на выбор от умения класса (плут: «Воровской жаргон»). */
  featureLanguages: (featureId: string) => `feature.${featureId}.languages`,
  /** Заклинательная характеристика для заклинаний вида (сбрасывается при смене вида, как все `trait.`). */
  speciesSpellAbility: 'trait.spellAbility',
  /** 2014: прибавки расы на выбор (полуэльф: две характеристики по +1; значения — id характеристик). */
  speciesAbilityBonus: 'trait.abilityBonus',
  /** 2014: вариант особенности расы («Наследие драконов»: id особенности-варианта). */
  traitOption: (traitId: string) => `trait.${traitId}.option`,
  /** Заговор вместо заданного особенностью (высший эльф: вместо «Фокусов»). */
  speciesCantrip: (traitId: string) => `trait.${traitId}.cantrip`,
  /** Варианты умений класса: воззвания колдуна, метамагия чародея (id из `content.classOptions`). */
  classOptions: (kind: 'invocation' | 'metamagic') =>
    kind === 'invocation' ? 'class.warlock.invocations' : 'class.sorcerer.metamagic',
  /** «Договор гримуара»: три заговора и два ритуала 1-го круга из любых списков. */
  tomeCantrips: 'class.warlock.tome.cantrips',
  tomeRituals: 'class.warlock.tome.rituals',
  /** Книга заклинаний волшебника: заклинания 1+ круга (подготовить можно только из неё). */
  spellbook: 'class.wizard.spellbook',
  /**
   * Стартовое снаряжение: номер варианта (A = 0) и выбор предмета внутри набора. `step` — номер выбора
   * (в 2024 выбор один; в 2014 их несколько: «(а) рапира или (б) короткий меч», «(а) короткий лук или…»).
   */
  equipment: (source: 'class' | 'background', step = 0) => (step ? `equip.${source}.${step}` : `equip.${source}`),
  equipmentPick: (source: 'class' | 'background', i: number, step = 0) =>
    step ? `equip.${source}.${step}.pick.${i}` : `equip.${source}.pick.${i}`,
  /** 2014: заклинание на выбор от особенности расы (заговор высшего эльфа). */
  traitSpell: (traitId: string) => `trait.${traitId}.spell`,
} as const;

/** Умения 1-го уровня с выбором одного из вариантов. */
export const FEATURE_OPTIONS: Record<string, FeatureOption[]> = {
  'cleric-divine-order': [
    {
      id: 'protector',
      name: { en: 'Protector', ru: 'Защитник' },
      description: {
        en: 'Proficiency with Martial weapons and Heavy armor.',
        ru: 'Владение воинским оружием и тяжёлыми доспехами.',
      },
      proficiencies: ['martial-weapons', 'heavy-armor'],
    },
    {
      id: 'thaumaturge',
      name: { en: 'Thaumaturge', ru: 'Чудотворец' },
      description: {
        en: 'One extra Cleric cantrip; WIS bonus to Arcana and Religion checks.',
        ru: 'Дополнительный заговор жреца; бонус МДР к проверкам Магии и Религии.',
      },
      extraCantrips: 1,
      // SRD 5.2: бонус к проверкам ИНТ (Магия или Религия), равный модификатору МДР (минимум +1).
      effects: [{ type: 'skillBonusFromAbility', skills: ['arcana', 'religion'], ability: 'wis', min: 1 }],
    },
  ],
  'druid-primal-order': [
    {
      id: 'magician',
      name: { en: 'Magician', ru: 'Волхв' },
      description: {
        en: 'One extra Druid cantrip; WIS bonus to Arcana and Nature checks.',
        ru: 'Дополнительный заговор друида; бонус МДР к проверкам Магии и Природы.',
      },
      extraCantrips: 1,
      // SRD 5.2: бонус к проверкам ИНТ (Магия или Природа), равный модификатору МДР (минимум +1).
      effects: [{ type: 'skillBonusFromAbility', skills: ['arcana', 'nature'], ability: 'wis', min: 1 }],
    },
    {
      id: 'warden',
      name: { en: 'Warden', ru: 'Страж' },
      description: {
        en: 'Proficiency with Martial weapons and Medium armor.',
        ru: 'Владение воинским оружием и средними доспехами.',
      },
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

/** 2014 (PHB): список любого из шести классов, характеристика — заклинательная характеристика этого класса. */
export const MAGIC_INITIATE_LISTS_2014 = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'] as const;

export const MAGIC_INITIATE_ABILITIES: AbilityId[] = ['int', 'wis', 'cha'];

// ---------- Мультикласс (SRD 5.2) ----------

/**
 * Как уровни класса идут в ячейки мультиклассового заклинателя: full — все уровни, half — половина
 * (с округлением вверх), pact — «Магия договора» колдуна, ячейки отдельно.
 */
export const SPELLCASTER_PROGRESSION: Record<string, 'full' | 'half' | 'pact'> = {
  bard: 'full',
  cleric: 'full',
  druid: 'full',
  sorcerer: 'full',
  wizard: 'full',
  paladin: 'half',
  ranger: 'half',
  warlock: 'pact',
};

/** Таблица «Multiclass Spellcaster» совпадает с таблицей ячеек полного заклинателя — берём её у этого класса. */
export const MULTICLASS_SLOTS_CLASS = 'wizard';

// ---------- Варианты умений классов (SRD 5.2) ----------

/** Сколько вариантов метамагии знает чародей: 2 со 2-го уровня, ещё 2 на 10-м и 17-м. */
export const METAMAGIC_COUNT: [level: number, count: number][] = [
  [2, 2],
  [10, 4],
  [17, 6],
];

/** Книга заклинаний волшебника (SRD 5.2): 6 заклинаний 1-го круга при создании и по 2 за каждый следующий уровень. */
export const SPELLBOOK_START = 6;
export const SPELLBOOK_PER_LEVEL = 2;

/** «Договор гримуара»: сколько заговоров и ритуалов 1-го круга в Книге теней. */
export const TOME_CANTRIPS = 3;
export const TOME_RITUALS = 2;

// ---------- Заклинания вида (SRD 5.2) ----------

/** Особенности вида, для которых игрок выбирает заклинательную характеристику: ИНТ, МДР или ХАР. */
export const SPECIES_SPELL_ABILITY_TRAITS = ['elven-lineage', 'fiendish-legacy', 'gnomish-lineage'];

export const SPECIES_SPELL_ABILITIES: AbilityId[] = ['int', 'wis', 'cha'];

/** Особенности с заданной характеристикой (Аасимар, «Несущий свет»: Харизма). */
// 2014 (SRD 5.1): заговор высшего эльфа творится Интеллектом.
export const SPECIES_SPELL_FIXED_ABILITY: Record<string, AbilityId> = {
  'light-bearer': 'cha',
  'high-elf-cantrip': 'int',
  // 2014 (PHB): магия дроу и «Наследие Ада» тифлинга — Харизма, природный иллюзионист (лесной гном) — Интеллект.
  'drow-magic': 'cha',
  'infernal-legacy': 'cha',
  'natural-illusionist': 'int',
};

/**
 * Сколько раз заклинание вида творится без ячейки до долгого отдыха. По умолчанию — 1
 * (родословные эльфа и наследие тифлинга); лесной гном: «Разговор с животными» — столько, каков БМ.
 */
export const SPECIES_SPELL_FREE_USES: Record<string, 'pb'> = { 'gnomish-lineage-forest-gnome': 'pb' };

/** Заговор вида, который после долгого отдыха можно заменить другим заговором списка класса (высший эльф). */
export const SPECIES_CANTRIP_SWAP: Record<string, string> = { 'high-elf-cantrip-versatility': 'wizard' };

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
