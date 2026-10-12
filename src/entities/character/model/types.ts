import type { AbilityId, ArmorInfo, Coin, LocalizedText } from '@/shared/content';

export type AbilityRoll = { dice: number[]; droppedIndex: number; total: number };

// ---------- Шаг 2: черты происхождения ----------

export type OriginFeat = { slot: OriginFeatSlot; featId?: string; source: 'background' | 'species' };

// ---------- Шаг 4: владения ----------

export type ProficiencySlot = {
  key: string;
  source: 'class' | 'background' | 'species' | 'feat';
  desc?: LocalizedText;
  choose: number;
  /** id владений. */
  options: string[];
};

// ---------- Шаг 5: снаряжение ----------

export type EquipmentSource = 'class' | 'background';

// ---------- Шаг 5: заклинания ----------

export type SpellLimits = {
  classId: string;
  cantrips: number;
  prepared: number;
  /** Самый высокий круг, для которого есть ячейки (подготовленные заклинания — с 1-го по этот). */
  maxSpellLevel: number;
};

// ---------- Проверка ----------
export type AbilityScores = Record<AbilityId, number>;

/** Уровни по классам. Для MVP один элемент, но модель допускает мультикласс. Первый элемент — стартовый класс. */
export type ClassEntry = { classId: string; subclassId?: string; level: number };

export type AbilityMethod = 'standard' | 'pointBuy' | 'roll';

/** Черта, выбранная игроком (черта предыстории не хранится — она берётся из предыстории). */
export type FeatChoice = {
  featId: string;
  /** Откуда черта: умение класса «Увеличение характеристик», особенность вида и т.п. */
  source: 'class' | 'species' | 'other';
  /** Уровень класса, на котором взята (для «Увеличения характеристик»). */
  level?: number;
  /** Прибавки к характеристикам от черты («Увеличение характеристик»: +2 или +1/+1). */
  abilityIncreases?: Partial<AbilityScores>;
  /** Предел, до которого черта может поднять характеристику (эпические дары — до 30). По умолчанию 20. */
  abilityCap?: number;
};

/**
 * Предмет в инвентаре. `itemId` — id снаряжения или магического предмета из справочника,
 * либо `custom:…` для своего предмета; тогда название хранится в `name`.
 */
export type InventoryItem = { itemId: string; quantity: number; equipped?: boolean; name?: string };

export type GameState = {
  currentHp: number;
  tempHp: number;
  /** Потраченные кости хитов по классам: { rogue: 2 }. */
  hitDiceSpent: Record<string, number>;
  /** Потраченные ячейки по кругам 1–9 (индекс 0 — 1-й круг). */
  slotsSpent: number[];
  /** Потраченные использования ресурсов умений: { rage: 1, 'lay-on-hands': 10 }. */
  resourcesSpent: Record<string, number>;
  deathSaves: { successes: number; failures: number };
  conditions: string[];
  exhaustion: number;
  heroicInspiration: boolean;
};

export type CharacterStatus = { kind: 'draft'; step: number } | { kind: 'ready' };

export type Character = {
  id: string;
  name: string;
  player?: string;
  portrait?: string;
  alignment?: string;
  /** Название кампании (показывается на карточке). */
  campaign?: string;
  notes?: string;

  classes: ClassEntry[];
  speciesId: string;
  subspeciesId?: string;
  backgroundId: string;

  abilityMethod: AbilityMethod;
  baseAbilities: AbilityScores;
  /** Распределение бонусов предыстории: +2/+1 или +1/+1/+1. */
  backgroundBonuses: Partial<AbilityScores>;
  /** Результаты бросков 4к6 (метод «Броски»), чтобы при возврате к шагу не перебрасывать. */
  abilityRolls?: number[];
  /** Размер, если вид позволяет выбрать (тифлинг: Маленький или Средний). */
  size?: string;

  /**
   * Выборы мастера создания «ключ → выбранные id»: навыки и инструменты на выбор, варианты умений,
   * черта от особенности «Универсальность», заклинания черты «Посвящённый в магию», стартовое снаряжение.
   * Ключи описаны в src/entities/character/config/constants.ts (CHOICE_KEYS).
   */
  choices: Record<string, string[]>;

  /** Дополнительные навыки (id навыков: 'stealth'). Навыки на выбор из мастера лежат в `choices`. */
  skillProficiencies: string[];
  /** Навыки с компетентностью. */
  expertise: string[];
  languages: string[];
  /** Дополнительные владения инструментами (id владений: 'tool-dice'). Выбор из мастера — в `choices`. */
  toolProficiencies: string[];
  feats: FeatChoice[];
  /** Оружие, для которого выбраны приёмы (id предметов). */
  weaponMasteries: string[];

  equipment: InventoryItem[];
  coins: Partial<Record<Coin, number>>;

  cantrips: string[];
  preparedSpells: string[];

  state: GameState;
  status: CharacterStatus;
  createdAt: string;
  updatedAt: string;
};

/** Слоты черт происхождения: черта предыстории и черта от особенности человека «Универсальность». */
export type OriginFeatSlot = 'bgfeat' | 'versatile';

export type FeatureOption = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Владения, которые даёт вариант. */
  proficiencies?: string[];
  /** Дополнительные заговоры из списка класса. */
  extraCantrips?: number;
};

// --- Хиты ---

export type HpLevel = { hitDie: number; level: number };

// --- Класс защиты ---

export type AcInput = {
  armor?: ArmorInfo;
  shield?: ArmorInfo;
  mods: AbilityScores;
  effects: Effect[];
};

// --- Атаки оружием ---

export type WeaponAttack = {
  itemId: string;
  ability: AbilityId;
  toHit: number;
  damageDice: string;
  damageBonus: number;
  damageType?: string;
  proficient: boolean;
};

export type Effect =
  /** Черта «Бдительность»: к инициативе прибавляется бонус мастерства. */
  | { type: 'initiativeAddsProficiency' }
  /** Прибавка к максимуму хитов за каждый уровень персонажа. */
  | { type: 'hpPerLevel'; value: number }
  /** Прибавка к максимуму хитов, равная уровню класса, начиная с указанного уровня. */
  | { type: 'hpPerClassLevel'; classId: string; fromLevel: number }
  /** Защита без доспехов: 10 + модификаторы указанных характеристик. */
  | { type: 'unarmoredDefense'; abilities: AbilityId[]; shieldAllowed: boolean }
  /** +N к КЗ всегда (Кованый: «Встроенная защита»). */
  | { type: 'acBonus'; value: number }
  /** +N к КЗ, пока надет доспех (лёгкий, средний или тяжёлый). */
  | { type: 'armoredAcBonus'; value: number }
  /** Прибавка к скорости без доспехов и щита (из столбца таблицы класса). */
  | { type: 'unarmoredSpeedFromClassTable'; classId: string; column: string };

// ---------- Спасброски от смерти ----------

export type DeathStatus = 'alive' | 'dying' | 'stable' | 'dead';

// ---------- Броски урона ----------

export type DamageRoll = { dice: number[]; sides: number; bonus: number; total: number };

/** Как ресурс восстанавливается: только долгим отдыхом, полностью коротким или по одному за короткий. */
export type ResourceRecovery = 'long' | 'short' | 'short-one';

export type ResourceView = {
  id: string;
  name: LocalizedText;
  max: number;
  spent: number;
  /** Кость ресурса (8 → к8). */
  die?: number;
  recovery: ResourceRecovery;
};

export type ResourceContext = { level: number; sheet: CharacterSheet; classId?: string };

export type SourcedId = { id: string; source: 'class' | 'subclass' | 'species' | 'feat' };

export type CharacterSheet = {
  level: number;
  profBonus: number;
  abilities: Record<AbilityId, { score: number; mod: number; save: number; saveProficient: boolean }>;
  skills: { id: string; ability: AbilityId; bonus: number; proficient: boolean; expertise: boolean }[];
  passivePerception: number;
  initiative: number;
  maxHp: number;
  armorClass: number;
  speed: number;
  hitDice: { classId: string; die: number; total: number }[];
  attacks: WeaponAttack[];
  spellcasting?: { classId: string; ability: AbilityId; saveDC: number; attackBonus: number; slots: number[] };
  /** Особые столбцы таблицы класса на текущем уровне (скрытая атака, ярость…). */
  classSpecific: Record<string, Record<string, unknown>>;
  /** Умения класса/подкласса, особенности вида и черты — для «Что умеет». */
  features: SourcedId[];
  /** id владений (proficiencies). */
  proficiencies: string[];
};

export type CharacterSummary = {
  /** Буква для аватара. */
  letter: string;
  level: number;
  classNames: LocalizedText[];
  species?: LocalizedText;
  background?: LocalizedText;
  /** Хиты и КЗ — только для готового персонажа, у черновика их ещё нельзя посчитать. */
  hp?: { current: number; max: number };
  armorClass?: number;
};

export type PlayApi = {
  character: Character;
  sheet: CharacterSheet;
  update: (fn: (c: Character) => Character) => void;
  updateState: (fn: (s: GameState) => GameState) => void;
};
