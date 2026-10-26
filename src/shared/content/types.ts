// Типы справочника (assets/content/content.json).
// Файл собирается скриптом data-pipeline/build.ts из сырых данных dnd5eapi + перевода.
// Идентификаторы (id) — это `index` из API: 'rogue', 'shortsword', 'skill-stealth' и т.п.

/** Текст на двух языках. `ru` нет, если перевод ещё не сделан — тогда показываем `en` с пометкой. */
export type LocalizedText = { en: string; ru?: string };

/** Редакция правил: 2024 (SRD 5.2) или 2014 (SRD 5.1). У каждой свой справочник. */
export type Edition = '2014' | '2024';

/** Прибавки к характеристикам (раса и подраса 2014). */
export type AbilityBonuses = Partial<Record<AbilityId, number>>;

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
  'skill' | 'savingThrow' | 'armor' | 'weapon' | 'tool' | 'artisanTool' | 'instrument' | 'other';

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
  /** 2014: сколько заклинаний известно (бард, следопыт, чародей, колдун). */
  known?: number;
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
  /**
   * `preparation` (2014): `known` — заклинания известны (число по таблице, `known`), `prepared` — готовятся
   * каждый день из всего списка класса. В 2024 поля нет: у всех число подготовленных по таблице.
   */
  spellcasting?: { ability: AbilityId; fromLevel: number; preparation?: 'known' | 'prepared' };
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
  /** 2014: умение-вариант другого умения (воззвание, стиль боя, метамагия) — id «родителя». */
  parent?: string;
  /** 2014: выбор вариантов умения (id умений-вариантов): стиль боя, договор, метамагия, воззвания. */
  optionChoice?: Choice;
  /** 2014: выбор компетентности (id владений). */
  expertiseChoice?: Choice;
  /** 2014: владения, которые даёт умение («Дополнительное владение» домена жизни — тяжёлые доспехи). */
  proficiencies?: string[];
  /** 2014: владения на выбор от умения (коллегия знаний — три навыка). */
  proficiencyChoices?: Choice[];
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
  /**
   * 2014: заклинания подкласса (домен жреца, клятва паладина и т.п.) с уровня класса `level`, всегда подготовлены.
   * `feature` — только при этом умении-варианте (Круг земли: местность).
   */
  spells?: { id: string; level: number; feature?: string }[];
  /** 2014: расширенный список колдуна — эти заклинания можно выбрать среди известных (не всегда подготовлены). */
  expandedSpells?: string[];
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
  /** 2014: прибавки к характеристикам от расы. */
  abilityBonuses?: AbilityBonuses;
  /** 2014: прибавки на выбор (полуэльф: +1 к двум другим характеристикам). */
  abilityBonusChoice?: { choose: number; bonus: number; options: AbilityId[] };
  /** 2014: языки расы (id языков) и язык на выбор. */
  languages?: string[];
  languageChoice?: Choice;
  /** Не из SRD: механика из других книг 2024 (data-pipeline/extra). */
  extra?: boolean;
};

export type Subspecies = {
  id: string;
  speciesId: string;
  name: LocalizedText;
  damageType?: string;
  traits: { id: string; level: number }[];
  /** 2014: прибавки к характеристикам от подрасы. */
  abilityBonuses?: AbilityBonuses;
  /** 2014: прибавки подрасы заменяют прибавки расы (подрасы тифлинга, Mordenkainen's Tome of Foes). */
  replacesAbilityBonuses?: boolean;
  /** 2014: особенности расы, которые заменяет подраса (id): у подрас тифлинга — «Наследие Ада». */
  replacesTraits?: string[];
  /** Не из SRD: механика из других книг 2024 (data-pipeline/extra). */
  extra?: boolean;
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
  /** 2014: владения без выбора (id владений): «Острые чувства» — Восприятие. */
  proficiencies?: string[];
  /** 2014: язык на выбор («Дополнительный язык»). */
  languageChoice?: Choice;
  /** 2014: заклинание на выбор (заговор высшего эльфа; id заклинаний). */
  spellChoice?: Choice;
  /** 2014: варианты особенности на выбор (id особенностей): «Наследие драконов». */
  subtraits?: string[];
  /** 2014: вариант какой особенности это («Наследие драконов (Красный)» → draconic-ancestry). */
  parent?: string;
  /** 2014: вид урона варианта («Наследие драконов (Красный)» — огонь). */
  damageType?: string;
  /** С какого уровня персонажа доступно заклинание из `spells` (нет записи — с 1-го): «Наследие Ада» тифлинга. */
  spellLevels?: Record<string, number>;
  /** Не из SRD: механика из других книг 2024 (data-pipeline/extra). */
  extra?: boolean;
};

export type Background = {
  id: string;
  name: LocalizedText;
  /** Три характеристики, к которым распределяются +2/+1 или +1/+1/+1. В 2014 — пусто: прибавки даёт раса. */
  abilities: AbilityId[];
  /** Черта происхождения. В 2014 предыстория черты не даёт. */
  featId?: string;
  /** Список заклинаний черты «Посвящённый в магию», если предыстория его задаёт (Прислужник — cleric). */
  featSpellList?: string;
  proficiencies: string[];
  proficiencyChoices: Choice[];
  equipment: Choice[];
  /** 2014: языки на выбор. */
  languageChoice?: Choice;
  /** 2014: умение предыстории («Приют для верующих»). */
  feature?: { name: LocalizedText; description: LocalizedText };
  /** Не из SRD: механика из Player's Handbook 2024 (data-pipeline/extra). */
  extra?: boolean;
};

export type FeatType = 'origin' | 'general' | 'fighting-style' | 'epic-boon';

export type Feat = {
  id: string;
  name: LocalizedText;
  type: FeatType;
  description: LocalizedText;
  /** `proficiency` (2014) — нужное владение («Тяжёлая броня» — средние доспехи); `spellcasting` — умение творить заклинания. */
  prerequisites?: {
    minLevel?: number;
    feature?: string;
    abilityOptions?: Choice;
    proficiency?: string;
    spellcasting?: boolean;
  };
  repeatable?: LocalizedText;
  /** Владения на выбор, которые даёт черта (id владений). */
  proficiencyChoices?: Choice[];
  /** 2014: владения без выбора («Средние доспехи» → medium-armor, shields). */
  proficiencies?: string[];
  /** 2014: +1 к одной из этих характеристик (не выше `cap`, по умолчанию 20) — «полуторные» черты. */
  abilityIncrease?: { abilities: AbilityId[]; cap?: number };
  /** 2014: владение спасбросками характеристики, к которой прибавка («Устойчивый»). */
  savingThrowFromIncrease?: boolean;
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

/** Механические эффекты предмета, пока надет (для предметов с настройкой — пока настроен). */
export type ItemEffect =
  | { type: 'acBonus'; value: number }
  | { type: 'savingThrowBonus'; value: number; ability?: AbilityId }
  | { type: 'speedBonus'; value: number }
  | { type: 'setAbilityScore'; ability: AbilityId; value: number }
  | { type: 'abilityBonus'; ability: AbilityId; value: number }
  | { type: 'skillProficiency'; skill: string }
  | { type: 'skillExpertise'; skill: string }
  | { type: 'skillAdvantage'; skill: string }
  | { type: 'damageResistance'; damageType: string }
  | { type: 'damageImmunity'; damageType: string };

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
  /** Магический бонус к атаке и урону (оружие) или к КЗ (броня/щит). +1/+2/+3. */
  magicBonus?: number;
  /** Дополнительный урон (например, 1к6 огнём у Пламенного клинка). */
  additionalDamage?: { dice: string; type: string }[];
  /** Механические эффекты предмета, пока надет. */
  effects?: ItemEffect[];
};

export type EquipmentCategory = { id: string; name: LocalizedText; equipment: string[] };

export type SpellAreaShape = 'cone' | 'cube' | 'cylinder' | 'emanation' | 'line' | 'sphere';

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
  /** Спасбросок цели («makes a Dexterity saving throw» в тексте SRD). */
  save?: AbilityId;
  /** Область действия: «15-foot Cone» → { shape: 'cone', size: 15 }. */
  area?: { shape: SpellAreaShape; size: number };
  /** Краткая сводка для заклинаний без урона и спасброска (spell.<id>.short в spells.csv, необязательно). */
  short?: LocalizedText;
  damage?: {
    type?: string;
    /** Урон по кругу ячейки (ключ — круг) или по уровню персонажа (заговоры). */
    bySlotLevel?: Record<string, string>;
    byCharacterLevel?: Record<string, string>;
    /** «Мистический заряд»: на 5/11/17 уровне не больше костей, а больше лучей (у каждого свой бросок атаки). */
    beams?: boolean;
    /** Вид урона выбирает заклинатель («Цветной шар»). */
    chosenType?: boolean;
    /** heal — лечение, tempHp — временные хиты; по умолчанию урон. */
    kind?: 'heal' | 'tempHp';
    /** Постоянная прибавка (по кругу ячейки): «10к6 + 40». */
    bonusBySlotLevel?: Record<string, number>;
    /** + модификатор заклинательной характеристики. */
    addModifier?: boolean;
    /** Число дротиков по кругу ячейки («Волшебная стрела»): каждый наносит кости + прибавку. */
    countBySlotLevel?: Record<string, number>;
  };
  description: LocalizedText;
  higherLevel?: LocalizedText;
  classes: string[];
  subclasses: string[];
  /** 2014: не из SRD 5.1 — заклинание PHB для особенности расы (data-pipeline/extra-2014/spells.json). */
  extra?: boolean;
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
  /** Механические эффекты предмета, пока надет (для предметов с настройкой — пока настроен). */
  effects?: ItemEffect[];
};

/** Как считается число (максимум ресурса или размер его кости). Уровень — уровень класса `classId` ресурса, иначе общий. */
export type ResourceFormula =
  | { fixed: number }
  /** Столбец таблицы класса на текущем уровне (rage_count, focus_points…). */
  | { classSpecific: string }
  /** {уровень: значение} — берётся значение для наибольшего уровня, не превышающего текущий. */
  | { byLevel: Record<string, number> }
  /** Модификатор характеристики + `plus`, не меньше `min` (2014, «Божественное чувство»: 1 + ХАР). */
  | { ability: AbilityId; min?: number; plus?: number }
  | { profBonus: true }
  /** уровень × perLevel + plus. */
  | { perLevel: number; plus?: number };

/** Вариант умения класса из SRD 5.2: таинственное воззвание колдуна или метамагия чародея. */
export type ClassOption = {
  id: string;
  classId: string;
  kind: 'invocation' | 'metamagic';
  name: LocalizedText;
  description: LocalizedText;
  prerequisite?: {
    /** Уровень класса. */
    level?: number;
    /** Нужное воззвание («Договор клинка»). */
    invocation?: string;
    /** Нужен заговор класса, наносящий урон (`damage`) или с броском атаки (`attack`). */
    cantrip?: 'damage' | 'attack';
  };
  repeatable?: boolean;
  /** Стоимость в очках чародейства (метамагия). */
  cost?: number;
  /** Заклинания без ячейки: `atWill` — сколько угодно, `longRest` — раз до долгого отдыха. */
  spells?: { id: string; free: 'atWill' | 'longRest' }[];
};

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
  edition: Edition;
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
  classOptions: ClassOption[];
};

/** Списки справочника, у записей которых есть id. */
type IndexedKey = { [K in keyof Content]: Content[K] extends { id: string }[] ? K : never }[keyof Content];

/** Таблицы справочника для поиска по id: для каждого списка — id → запись. */
export type ContentIndex = { [K in IndexedKey]: ReadonlyMap<string, Content[K][number]> };
