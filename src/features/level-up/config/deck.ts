import type { LevelChoiceKind, LevelUpCardType, NumberKey } from '../model/types';

/** Порядок карт в колоде (docs/features/level-up.md, раздел 5). */
export const CARD_ORDER: LevelUpCardType[] = [
  'hp',
  'growth',
  'multiclass',
  'feature',
  'choice',
  'magic',
  'species',
  'capstone',
];

/** Порядок карт выбора: подкласс → черта / характеристики → остальные выборы → замена (необязательно). */
export const CHOICE_ORDER: LevelChoiceKind[] = [
  'subclass',
  'feat',
  'multiclassProficiency',
  'featureOption',
  'optionChoice',
  'classOption',
  'expertise',
  'fightingStyle',
  'skills',
  'featureLanguages',
  'languages',
  'masteries',
  'spells',
  'spellbook',
  'replaceOption',
];

/** Выборы заклинаний живут в карте магии своего класса, а не отдельной картой. */
export const MAGIC_CHOICES: LevelChoiceKind[] = ['spells', 'spellbook'];

/** Числа, которые растут вместе с бонусом мастерства или характеристикой (раскрываются под их строкой). */
export const DERIVED_NUMBERS: NumberKey[] = [
  'save',
  'skill',
  'attack',
  'attackDamage',
  'spellSaveDC',
  'spellAttack',
  'initiative',
  'passivePerception',
  'passiveInsight',
  'passiveInvestigation',
];

/** Столбцы таблиц классов, которые показываются в карте магии, а не в росте. */
export const MAGIC_COLUMN = /^(mystic_arcanum|magical_secrets)/;

/** Столбцы-кости, записанные размером кости (6 → к6). */
export const DIE_COLUMNS = new Set(['bardic_inspiration_die', 'martial_arts_die', 'song_of_rest_die']);

/** Столбцы в футах. */
export const FEET_COLUMNS = new Set(['unarmored_movement_bonus', 'unarmored_movement', 'aura_range']);

/** Умения-заглушки таблицы класса: вместо них — карты выбора (подкласс, черта, эпический дар). */
export const PLACEHOLDER_FEATURE = /-(subclass|ability-score-improvement(-\d+)?|epic-boon)$/;

/** Уровень класса, умения которого — вершина (карта `capstone`). */
export const CAPSTONE_LEVEL = 20;

/** Приоритет чисел для итоговой карточки (раздел 7.2, keyNumbersPreview). */
export const KEY_NUMBER_PRIORITY: NumberKey[] = [
  'maxHp',
  'attack',
  'spellSaveDC',
  'skill',
  'passivePerception',
  'armorClass',
  'profBonus',
  'ability',
  'save',
  'spellAttack',
  'initiative',
  'speed',
  'attackDamage',
  'passiveInsight',
  'passiveInvestigation',
];

/** Предпросмотр выбора: сколько строк и какие числа считаются побочным эффектом. */
export const CHOICE_PREVIEW_ROWS = 3;
export const SIDE_EFFECT_NUMBERS: NumberKey[] = [
  'passivePerception',
  'passiveInsight',
  'passiveInvestigation',
  'initiative',
];

/** Сколько главных изменений на итоговой карточке. */
export const KEY_NUMBERS_LIMIT = 6;
