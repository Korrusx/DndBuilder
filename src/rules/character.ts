// Модель персонажа: только выборы игрока и текущее состояние игры.
// Все производные числа (модификаторы, навыки, КЗ, хиты…) считаются функциями из src/rules.

import type { AbilityId, Coin } from '@/content/types';

export type AbilityScores = Record<AbilityId, number>;

export const ABILITY_IDS: AbilityId[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

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
};

export type InventoryItem = { itemId: string; quantity: number; equipped?: boolean };

export type GameState = {
  currentHp: number;
  tempHp: number;
  /** Потраченные кости хитов по классам: { rogue: 2 }. */
  hitDiceSpent: Record<string, number>;
  /** Потраченные ячейки по кругам 1–9 (индекс 0 — 1-й круг). */
  slotsSpent: number[];
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

  /** Навыки, выбранные игроком (id навыков: 'stealth'). Навыки предыстории сюда не входят. */
  skillProficiencies: string[];
  /** Навыки с компетентностью. */
  expertise: string[];
  languages: string[];
  /** Выбранные владения инструментами (id владений: 'tool-dice'). */
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

export function emptyGameState(): GameState {
  return {
    currentHp: 0,
    tempHp: 0,
    hitDiceSpent: {},
    slotsSpent: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    deathSaves: { successes: 0, failures: 0 },
    conditions: [],
    exhaustion: 0,
    heroicInspiration: false,
  };
}

export function totalLevel(classes: ClassEntry[]): number {
  return classes.reduce((sum, c) => sum + c.level, 0);
}

/** Пустой черновик: игрок ещё ничего не выбрал. Мастер создания заполняет его шаг за шагом. */
export function newDraftCharacter(id: string, now: string): Character {
  return {
    id,
    name: '',
    classes: [],
    speciesId: '',
    backgroundId: '',
    abilityMethod: 'standard',
    baseAbilities: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
    backgroundBonuses: {},
    skillProficiencies: [],
    expertise: [],
    languages: [],
    toolProficiencies: [],
    feats: [],
    weaponMasteries: [],
    equipment: [],
    coins: {},
    cantrips: [],
    preparedSpells: [],
    state: emptyGameState(),
    status: { kind: 'draft', step: 1 },
    createdAt: now,
    updatedAt: now,
  };
}
