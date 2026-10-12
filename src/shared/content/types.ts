// Типы справочника (assets/content/content.json).
// Файл собирается скриптом data-pipeline/build.ts из сырых данных dnd5eapi + перевода.
// Идентификаторы (id) — это `index` из API: 'rogue', 'shortsword', 'skill-stealth' и т.п.

/** Текст на двух языках. `ru` нет, если перевод ещё не сделан — тогда показываем `en` с пометкой. */
export type LocalizedText = { en: string; ru?: string };

export type AbilityId = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type Coin = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

/** Выбор «выберите N из …» (навыки, снаряжение, инструменты). */
export type Choice = {
  choose: number;
  desc?: LocalizedText;
  /** Варианты списком. */
  options?: ChoiceOption[];
  /** Либо «любой предмет из категории снаряжения». */
  fromCategory?: string;
};

export type ChoiceOption =
  /** Ссылка на владение (proficiencies) или характеристику — по контексту выбора. */
  | { kind: 'ref'; id: string }
  /** Предмет снаряжения в количестве. */
  | { kind: 'item'; id: string; count: number }
  | { kind: 'money'; amount: number; unit: Coin }
  /** Всё перечисленное вместе (набор). */
  | { kind: 'all'; items: ChoiceOption[] }
  /** Вложенный выбор. */
  | { kind: 'choice'; choice: Choice }
  /** Минимальное значение характеристики (пререквизиты). */
  | { kind: 'minScore'; ability: AbilityId; min: number };

export type Ability = {
  id: AbilityId;
  abbr: LocalizedText;
  name: LocalizedText;
  description: LocalizedText;
};

export type Skill = {
  id: string;
  ability: AbilityId;
  name: LocalizedText;
  description: LocalizedText;
};

export type ProficiencyType =
  | 'skill'
  | 'savingThrow'
  | 'armor'
  | 'weapon'
  | 'tool'
  | 'artisanTool'
  | 'instrument'
  | 'other';

export type Proficiency = {
  id: string;
  type: ProficiencyType;
  name: LocalizedText;
  /** На что ссылается владение: id навыка, характеристики, предмета или категории снаряжения. */
  refId?: string;
};

/** Простая запись «название + описание» (состояния, типы урона, школы, свойства оружия, приёмы). */
export type SimpleEntry = { id: string; name: LocalizedText; description: LocalizedText };

export type Alignment = SimpleEntry & { abbr: LocalizedText };
export type Language = { id: string; name: LocalizedText; rare: boolean; note?: LocalizedText };

export type SpellcastingProgression = {
  cantrips: number;
  prepared: number;
  /** Ячейки по кругам 1–9. */
  slots: number[];
};

export type ClassLevel = {
  level: number;
  profBonus: number;
  /** id умений (features), получаемых на этом уровне. */
  features: string[];
  /** Особые столбцы таблицы класса: sneak_attack, rage_count, martial_arts_die и т.п. */
  classSpecific?: Record<string, unknown>;
  spellcasting?: SpellcastingProgression;
};

export type CharacterClass = {
  id: string;
  name: LocalizedText;
  hitDie: number;
  /** Основные характеристики. Если `primaryAbilityChoice` = true, нужна одна из списка (воин: СИЛ или ЛОВ). */
  primaryAbilities: AbilityId[];
  primaryAbilityChoice: boolean;
  savingThrows: AbilityId[];
  /** Владения (id из proficiencies), без спасбросков. */
  proficiencies: string[];
  proficiencyChoices: Choice[];
  startingEquipment: Choice[];
  multiclass: { prerequisites: Choice[]; proficiencies: string[]; proficiencyChoices: Choice[] };
  spellcasting?: { ability: AbilityId; fromLevel: number };
  subclasses: string[];
  levels: ClassLevel[];
};

export type Feature = {
  id: string;
  classId: string;
  subclassId?: string;
  level: number;
  name: LocalizedText;
  description: LocalizedText;
  /** Не из SRD: механика из Player's Handbook 2024 (data-pipeline/extra). */
  extra?: boolean;
};

export type Subclass = {
  id: string;
  classId: string;
  name: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  /** id умений подкласса (сами умения лежат в `features`). */
  features: string[];
  /** Не из SRD: механика из Player's Handbook 2024 (data-pipeline/extra). */
  extra?: boolean;
};

export type Species = {
  id: string;
  name: LocalizedText;
  creatureType: string;
  /** Обычно один размер; у человека, например, можно выбрать Средний или Маленький. */
  sizes: string[];
  speed: number;
  traits: string[];
  subspecies: string[];
};

export type Subspecies = {
  id: string;
  speciesId: string;
  name: LocalizedText;
  damageType?: string;
  traits: { id: string; level: number }[];
};

export type Trait = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  species: string[];
  subspecies: string[];
  spells?: string[];
  proficiencyChoices?: Choice[];
  speed?: number;
};

export type Background = {
  id: string;
  name: LocalizedText;
  /** Три характеристики, к которым распределяются +2/+1 или +1/+1/+1. */
  abilities: AbilityId[];
  featId: string;
  /** Список заклинаний черты «Посвящённый в магию», если предыстория его задаёт (Прислужник — cleric). */
  featSpellList?: string;
  proficiencies: string[];
  proficiencyChoices: Choice[];
  equipment: Choice[];
  /** Не из SRD: механика из Player's Handbook 2024 (data-pipeline/extra). */
  extra?: boolean;
};

export type FeatType = 'origin' | 'general' | 'fighting-style' | 'epic-boon';

export type Feat = {
  id: string;
  name: LocalizedText;
  type: FeatType;
  description: LocalizedText;
  prerequisites?: { minLevel?: number; feature?: string; abilityOptions?: Choice };
  repeatable?: LocalizedText;
  /** Владения на выбор, которые даёт черта (id владений). */
  proficiencyChoices?: Choice[];
  /** Не из SRD: механика из Player's Handbook 2024 (data-pipeline/extra). */
  extra?: boolean;
};

export type WeaponInfo = {
  category: 'simple' | 'martial';
  range: 'melee' | 'ranged';
  damage?: { dice: string; type: string };
  twoHandedDamage?: { dice: string; type: string };
  /** Дистанция в футах: обычная/максимальная. */
  reach: { normal: number; long?: number };
  throwRange?: { normal: number; long?: number };
  properties: string[];
  mastery?: string;
  ammunition?: string;
};

export type ArmorInfo = {
  category: 'light' | 'medium' | 'heavy' | 'shield';
  base: number;
  dexBonus: boolean;
  /** Максимальный бонус ЛОВ (средний доспех: 2). Нет поля — без ограничения. */
  maxDex?: number;
  strMinimum: number;
  stealthDisadvantage: boolean;
};

export type ToolInfo = {
  ability?: AbilityId;
  utilize: { name: LocalizedText; dc?: number }[];
  craft: string[];
};

export type Equipment = {
  id: string;
  name: LocalizedText;
  categories: string[];
  cost: { amount: number; unit: Coin };
  weight?: number;
  /** Сколько штук продаётся за указанную цену (стрелы: 20). */
  quantity?: number;
  description?: LocalizedText;
  weapon?: WeaponInfo;
  armor?: ArmorInfo;
  tool?: ToolInfo;
  /** Содержимое набора снаряжения. */
  contents?: { id: string; count: number }[];
};

export type EquipmentCategory = { id: string; name: LocalizedText; equipment: string[] };

export type Spell = {
  id: string;
  name: LocalizedText;
  level: number;
  school: string;
  castingTime: LocalizedText;
  range: LocalizedText;
  duration: LocalizedText;
  components: ('V' | 'S' | 'M')[];
  material?: LocalizedText;
  concentration: boolean;
  ritual: boolean;
  attackType?: 'melee' | 'ranged';
  damage?: {
    type?: string;
    /** Урон по кругу ячейки (ключ — круг) или по уровню персонажа (заговоры). */
    bySlotLevel?: Record<string, string>;
    byCharacterLevel?: Record<string, string>;
  };
  description: LocalizedText;
  higherLevel?: LocalizedText;
  classes: string[];
  subclasses: string[];
};

export type MagicItem = {
  id: string;
  name: LocalizedText;
  category: string;
  /** Первая строка описания: «Чудесный предмет», «Доспех (любой лёгкий)» и т.п. */
  kind: LocalizedText;
  rarity: LocalizedText;
  attunement: boolean;
  limitedTo?: LocalizedText;
  description: LocalizedText;
  variants: string[];
  isVariant: boolean;
};

/** Как считается число (максимум ресурса или размер его кости). Уровень — уровень класса `classId` ресурса, иначе общий. */
export type ResourceFormula =
  | { fixed: number }
  /** Столбец таблицы класса на текущем уровне (rage_count, focus_points…). */
  | { classSpecific: string }
  /** {уровень: значение} — берётся значение для наибольшего уровня, не превышающего текущий. */
  | { byLevel: Record<string, number> }
  /** Модификатор характеристики, не меньше `min`. */
  | { ability: AbilityId; min?: number }
  | { profBonus: true }
  /** уровень × perLevel + plus. */
  | { perLevel: number; plus?: number };

/** Ресурс умения с ограниченным числом использований (ярость, кости превосходства…). */
export type ClassResource = {
  id: string;
  name: LocalizedText;
  /** Ресурс есть, если у персонажа есть любое из этих умений, особенностей вида или черт. */
  features: string[];
  /** Класс, по уровню которого считаются формулы и `minLevel`. */
  classId?: string;
  minLevel?: number;
  max: ResourceFormula;
  /** Кость ресурса (8 → к8), если есть. */
  die?: ResourceFormula;
  /** Короткий отдых: 'all' — восстанавливает всё, 'one' — одно использование. Долгий отдых — всегда всё. */
  short?: 'all' | 'one';
  /** Короткий отдых восстанавливает всё, если есть это умение (бард: «Источник вдохновения»). */
  shortWith?: string;
};

export type Content = {
  /** Версия формата файла. Меняется, когда меняется структура. */
  schemaVersion: number;
  /** Версия содержимого (хэш). Меняется при любом изменении данных или перевода. */
  version: string;
  source: string;
  abilities: Ability[];
  skills: Skill[];
  alignments: Alignment[];
  languages: Language[];
  conditions: SimpleEntry[];
  damageTypes: SimpleEntry[];
  magicSchools: SimpleEntry[];
  weaponProperties: SimpleEntry[];
  weaponMasteries: SimpleEntry[];
  proficiencies: Proficiency[];
  classes: CharacterClass[];
  features: Feature[];
  subclasses: Subclass[];
  species: Species[];
  subspecies: Subspecies[];
  traits: Trait[];
  backgrounds: Background[];
  feats: Feat[];
  equipment: Equipment[];
  equipmentCategories: EquipmentCategory[];
  spells: Spell[];
  magicItems: MagicItem[];
  resources: ClassResource[];
};

/** Списки справочника, у записей которых есть id. */
type IndexedKey = { [K in keyof Content]: Content[K] extends { id: string }[] ? K : never }[keyof Content];

/** Таблицы справочника для поиска по id: для каждого списка — id → запись. */
export type ContentIndex = { [K in IndexedKey]: ReadonlyMap<string, Content[K][number]> };
