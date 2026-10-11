// Ключи выборов мастера создания (поле `choices` персонажа) и правила, которые из них следуют.
// В справочнике эти варианты описаны только текстом, поэтому таблицы ниже — по тексту SRD 5.2.

import type { AbilityId, LocalizedText } from '@/content/types';
import type { Character } from './character';

/** Слоты черт происхождения: черта предыстории и черта от особенности человека «Универсальность». */
export type OriginFeatSlot = 'bgfeat' | 'versatile';

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
  /** Стартовое снаряжение: номер варианта (A = 0) и выбор предмета внутри набора. */
  equipment: (source: 'class' | 'background') => `equip.${source}`,
  equipmentPick: (source: 'class' | 'background', i: number) => `equip.${source}.pick.${i}`,
} as const;

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

export type FeatureOption = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Владения, которые даёт вариант. */
  proficiencies?: string[];
  /** Дополнительные заговоры из списка класса. */
  extraCantrips?: number;
};

/**
 * Умения 1-го уровня с выбором одного из вариантов.
 * TODO: бонус МДР к проверкам Магии/Религии (Чудотворец) и Магии/Природы (Волхв) пока не считается.
 */
export const FEATURE_OPTIONS: Record<string, FeatureOption[]> = {
  'cleric-divine-order': [
    {
      id: 'protector',
      name: { en: 'Protector', ru: 'Защитник' },
      description: { en: '', ru: 'Владение воинским оружием и тяжёлыми доспехами.' },
      proficiencies: ['martial-weapons', 'heavy-armor'],
    },
    {
      id: 'thaumaturge',
      name: { en: 'Thaumaturge', ru: 'Чудотворец' },
      description: { en: '', ru: 'Дополнительный заговор жреца; бонус МДР к проверкам Магии и Религии.' },
      extraCantrips: 1,
    },
  ],
  'druid-primal-order': [
    {
      id: 'magician',
      name: { en: 'Magician', ru: 'Волхв' },
      description: { en: '', ru: 'Дополнительный заговор друида; бонус МДР к проверкам Магии и Природы.' },
      extraCantrips: 1,
    },
    {
      id: 'warden',
      name: { en: 'Warden', ru: 'Страж' },
      description: { en: '', ru: 'Владение воинским оружием и средними доспехами.' },
      proficiencies: ['martial-weapons', 'medium-armor'],
    },
  ],
};

/** Умения, которые дают черту определённого типа (воин: «Боевой стиль»). */
export const FEAT_FEATURES: Record<string, 'fighting-style'> = {
  'fighter-fighting-style': 'fighting-style',
};

/** Владения от выбранных вариантов умений. */
export function featureOptionProficiencies(c: Character): string[] {
  return Object.entries(FEATURE_OPTIONS).flatMap(([featureId, options]) => {
    const chosen = choice1(c, CHOICE_KEYS.featureOption(featureId));
    return options.find((o) => o.id === chosen)?.proficiencies ?? [];
  });
}

/** Списки заклинаний для «Посвящённого в магию». */
export const MAGIC_INITIATE_LISTS = ['cleric', 'druid', 'wizard'] as const;
export const MAGIC_INITIATE_ABILITIES: AbilityId[] = ['int', 'wis', 'cha'];

/**
 * Предыстории SRD 5.2 дают «Посвящённого в магию» с заданным списком:
 * Прислужник — жреца, Мудрец — волшебника. В данных API список не указан.
 */
export const BACKGROUND_SPELL_LIST: Record<string, string> = {
  acolyte: 'cleric',
  sage: 'wizard',
};

/** Сколько стандартных языков выбирается при создании (кроме Общего). */
export const STANDARD_LANGUAGE_COUNT = 2;
