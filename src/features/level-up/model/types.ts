import type { CharacterSheet, HpMethod, ResourceView, SourcedId } from '@/entities/character';
import type { FeatureAction, LocalizedText } from '@/shared/content';

export type FeatSlotKind = 'asi' | 'epic-boon';

export type LevelUpPlan = {
  classId: string;
  /** Новый уровень класса. */
  toLevel: number;
  /** Новый общий уровень персонажа: им помечаются выборы уровня (черта, навыки). */
  charLevel: number;
  /** Класс взят впервые (мультикласс). */
  isNewClass: boolean;
  /** Владения на выбор от нового класса (навык плута, инструмент барда…). */
  multiclassChoices: { key: string; choose: number; desc?: LocalizedText; options: string[] }[];
  /** Умения нового уровня с выбором варианта («Божественный порядок»). */
  featureOptions: string[];
  /**
   * 2014: умения-варианты нового уровня (боевой стиль, договор, метамагия, воззвания): ключ выбора,
   * сколько вариантов должно быть выбрано всего (у воззваний — число известных по таблице колдуна) и из чего.
   */
  optionChoices: { featureId: string; key: string; total: number; options: string[] }[];
  /** Умения класса и подкласса, получаемые на новом уровне. */
  features: { id: string; source: 'class' | 'subclass' }[];
  needsSubclass: boolean;
  featSlot: FeatSlotKind | null;
  expertise: number;
  fightingStyles: number;
  skillChoices: { key: string; featureId: string; choose: number; options: string[] }[];
  languages: number;
};

/** `action: 'spells'` — у проблемы есть кнопка «Выбрать заклинания». */
export type LevelUpIssue = { message: string; blocking: boolean; action?: 'spells' };

// ---------- Колода новинок (docs/features/level-up.md) ----------

/** Значение столбца таблицы класса: число, кости («3d6») или да/нет. */
export type ColumnValue = number | string | boolean;

/** Всё, что колода сравнивает у персонажа на уровне: лист и то, чего в листе нет (ресурсы, лимиты, урон). */
export type LevelSnapshot = {
  level: number;
  classLevels: Record<string, number>;
  sheet: CharacterSheet;
  /** Умения с источником; особенности вида — только уже доступные на этом уровне. */
  features: SourcedId[];
  resources: Pick<ResourceView, 'id' | 'max' | 'die' | 'recovery'>[];
  /** Особые столбцы таблиц классов в удобном виде (кости — «3d6»). */
  columns: Record<string, Record<string, ColumnValue>>;
  /** Лимиты заклинаний по классам. `spellbook` — заклинаний в книге (волшебник). */
  casters: { classId: string; cantrips: number; prepared: number; spellbook?: number }[];
  /** Общие ячейки по кругам (без «Магии договора»). */
  slots: number[];
  pact?: PactSlots;
  /** Урон известных заговоров (класс, вид, черты) по уровню персонажа. */
  cantripDamage: Record<string, string>;
  /** Урон особенностей вида по уровню персонажа («Оружие дыхания»). */
  traitDamage: Record<string, string>;
  /** Всегда подготовленные заклинания подкласса. */
  alwaysPrepared: string[];
  /** Заклинания вида, доступные на этом уровне. */
  speciesSpells: string[];
  /** Прибавка к максимуму хитов от каждого умения (дварфийская стойкость, «Крепкий»…). */
  hpBonuses: Record<string, number>;
  conMod: number;
  passives: { insight: number; investigation: number };
};

export type PactSlots = { count: number; circle: number };

export type NumberKey =
  | 'maxHp'
  | 'profBonus'
  | 'armorClass'
  | 'speed'
  | 'initiative'
  | 'passivePerception'
  | 'passiveInsight'
  | 'passiveInvestigation'
  | 'ability'
  | 'save'
  | 'skill'
  | 'attack'
  | 'attackDamage'
  | 'spellSaveDC'
  | 'spellAttack';

/** Изменившееся число. `ref` — характеристика, навык, ключ атаки или класс-заклинатель. */
export type NumberChange = { key: NumberKey; ref?: string; before: number | string; after: number | string };

export type Change<T> = { before?: T; after: T };

export type SheetDiff = {
  level: { before: number; after: number };
  added: SourcedId[];
  /** Новые умения, которые улучшают уже имевшиеся (`from`). В `added` их нет. */
  upgraded: (SourcedId & { from: string })[];
  removed: SourcedId[];
  numbers: NumberChange[];
  columns: ({ classId: string; column: string } & Change<ColumnValue>)[];
  /** Ресурсы: `before` нет — ресурс появился на этом уровне. */
  resources: ({ id: string; recovery: ResourceView['recovery'] } & Change<{ max: number; die?: number }>)[];
  slots: { circle: number; before: number; after: number }[];
  pact?: Change<PactSlots>;
  spellLimits: ({ classId: string; limit: 'cantrips' | 'prepared' | 'spellbook' } & Change<number>)[];
  cantripDamage: ({ spellId: string } & Change<string>)[];
  traitDamage: ({ traitId: string } & Change<string>)[];
  alwaysPrepared: string[];
  speciesSpells: string[];
  /** На сколько выросла прибавка к хитам от каждого умения. */
  hpBonuses: { sourceId: string; value: number }[];
  conMod: { before: number; after: number };
};

export type LevelChoiceKind =
  | 'subclass'
  | 'multiclassProficiency'
  | 'featureOption'
  | 'optionChoice'
  | 'featureLanguages'
  | 'feat'
  | 'expertise'
  | 'fightingStyle'
  | 'skills'
  | 'languages'
  | 'spells'
  | 'spellbook'
  | 'masteries'
  | 'classOption'
  | 'replaceOption';

/** Выбор уровня: что выбрать, сколько, сделан ли и что мешает закончить повышение. */
export type LevelChoice = {
  id: string;
  kind: LevelChoiceKind;
  /** Без него колода не пускает дальше. */
  required: boolean;
  /** Без него нельзя применить повышение (как в `levelUpIssues`). */
  blocking: boolean;
  /** Сколько нужно выбрать на этом уровне. */
  count: number;
  /** Сколько уже выбрано на этом уровне. */
  picked: number;
  done: boolean;
  /** Ключ в `Character.choices`, если выбор хранится там. */
  key?: string;
  /** Умение, которое даёт выбор. */
  featureId?: string;
  source: 'class' | 'subclass' | 'multiclass' | 'feat';
  classId: string;
  featSlot?: FeatSlotKind;
  optionKind?: 'invocation' | 'metamagic';
  /** Что не так (тексты для `levelUpIssues`), пусто — выбор в порядке. */
  problems: string[];
  action?: LevelUpIssue['action'];
};

export type LevelUpCardType = 'hp' | 'growth' | 'feature' | 'choice' | 'magic' | 'species' | 'multiclass' | 'capstone';

export type CardRowLabel =
  | { kind: 'number'; key: NumberKey; ref?: string }
  | { kind: 'column'; classId: string; column: string }
  | { kind: 'resource'; id: string }
  | { kind: 'slots'; circle: number }
  | { kind: 'pact' }
  | { kind: 'limit'; classId: string; limit: 'cantrips' | 'prepared' | 'spellbook' }
  | { kind: 'cantrip'; spellId: string }
  | { kind: 'trait'; traitId: string }
  | { kind: 'spell'; spellId: string; list: 'alwaysPrepared' | 'species' }
  | { kind: 'proficiency'; id: string }
  | { kind: 'feature'; id: string };

export type CardRowValue = number | string | boolean | PactSlots | { max: number; die?: number };

/** Строка «было → стало». `before` нет — новое. `details` — что выросло вместе с этим числом. */
export type CardRow = { label: CardRowLabel; before?: CardRowValue; after: CardRowValue; details?: CardRow[] };

export type CardTag =
  | { kind: 'action'; action: FeatureAction }
  | { kind: 'uses'; max: number; recovery: ResourceView['recovery'] }
  /** Умение срабатывает в действии «Атака» («Дополнительная атака»). */
  | { kind: 'attackAction' }
  /** Сколько атак в действии «Атака». */
  | { kind: 'attacks'; count: number };

/** Откуда новинка. */
export type CardSource = {
  kind: 'class' | 'subclass' | 'species' | 'feat' | 'general' | 'multiclass';
  id?: string;
  level?: number;
};

export type HpBreakdownPart =
  | { kind: 'die'; method: HpMethod; die: number; value: number }
  | { kind: 'con'; value: number }
  /** Добавка до 1 хита за уровень при отрицательной ТЕЛ. */
  | { kind: 'minimum'; value: number }
  | { kind: 'bonus'; sourceId: string; value: number }
  | { kind: 'retroCon'; perLevel: number; levels: number; value: number }
  | { kind: 'other'; value: number };

export type HpResult = { gain: number; breakdown: HpBreakdownPart[] };

/**
 * Карта колоды. Тексты не хранятся: название и описание берутся по `ref` из справочника на текущем языке,
 * подписи строк — по `label` (так колода не зависит от языка и проверяется тестами по id и числам).
 */
export type LevelUpCard = {
  id: string;
  type: LevelUpCardType;
  source: CardSource;
  ref?: { table: 'features' | 'traits' | 'classes' | 'species'; id: string };
  tags?: CardTag[];
  rows?: CardRow[];
  /** id умения, которое улучшено этой новинкой. */
  upgradedFrom?: string;
  choice?: LevelChoice;
  hp?: HpResult & { die: number; maxBefore: number; maxAfter: number };
  state: 'hidden' | 'revealed' | 'done';
};

export type Deck = {
  cards: LevelUpCard[];
  /** Обязательные выборы, которые ещё не сделаны (первый — для подписи на «Дальше»). */
  blockers: LevelChoice[];
  /** Новинок (карт без хитов) и выборов — для «N новинок, M выборов». */
  counts: { news: number; choices: number };
  /** Для блока «Без изменений»: что на этом уровне не растёт. */
  unchanged: ('profBonus' | 'dice')[];
};

/** Новинка следующего уровня для блока «На следующем уровне». */
export type NextLevelItem =
  { kind: 'feature'; id: string; source: SourcedId['source'] } | { kind: 'row'; row: CardRow };

/** Настройки повышения уровня (meta.levelUpSettings). */
export type LevelUpSettings = {
  /** Можно перебросить уже брошенные хиты уровня. */
  allowHpReroll: boolean;
  /** Анимации колоды (при системном «уменьшении движения» их нет в любом случае). */
  animations: boolean;
};

// ---------- Экран «Новое на N-м уровне» (design/level-up/deck-screen-spec.md) ----------

/** Группа раскрытого списка роста. */
export type GrowthGroupId = 'saves' | 'skills' | 'attacks' | 'magic' | 'species' | 'other';

export type GrowthGroup = { id: GrowthGroupId; rows: CardRow[] };

/** Счётчик, готовность «Дальше» и подсказка под ней. */
export type DeckProgress = {
  revealed: number;
  total: number;
  choicesDone: number;
  /** Выборов на карточках (обязательные и необязательные). 0 — выборов на уровне нет. */
  choicesTotal: number;
  /** Обязательных выборов на уровне (для «выбор сделан» / «выборы сделаны»). */
  choicesRequired: number;
  ready: boolean;
  hint: string;
};

/** Выбранное на этом уровне: название и круг заклинания (для чипов магии). */
export type PickedItem = { id: string; name: string; circle?: number };

/** Строка ячеек карты магии: круг, сколько стало и сколько было. */
export type SlotLine = { circle: number; count: number; before: number };
