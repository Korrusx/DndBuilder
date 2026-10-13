// Модель персонажа: только выборы игрока и текущее состояние игры.
// Все производные числа (модификаторы, навыки, КЗ, хиты…) считаются функциями из src/entities/character/model.

import type { Edition } from '@/shared/content';

import type { Character, ClassEntry, GameState } from './types';

export function emptyGameState(): GameState {
  return {
    currentHp: 0,
    tempHp: 0,
    hitDiceSpent: {},
    slotsSpent: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    resourcesSpent: {},
    deathSaves: { successes: 0, failures: 0 },
    conditions: [],
    exhaustion: 0,
    heroicInspiration: false,
    raging: false,
  };
}

export function totalLevel(classes: ClassEntry[]): number {
  return classes.reduce((sum, c) => sum + c.level, 0);
}

/** Пустой черновик: игрок ещё ничего не выбрал. Мастер создания заполняет его шаг за шагом. */
export function newDraftCharacter(id: string, now: string, edition: Edition = '2024'): Character {
  return {
    id,
    name: '',
    edition,
    classes: [],
    speciesId: '',
    backgroundId: '',
    abilityMethod: 'standard',
    // 0 — значение ещё не назначено.
    baseAbilities: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    backgroundBonuses: {},
    choices: {},
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
