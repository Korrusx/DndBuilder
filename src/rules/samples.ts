// Контрольный персонаж из CLAUDE.md: Ирма Вейл, плут, полурослик, предыстория «Преступник».
import { emptyGameState, type Character } from './character';

export function irmaLevel1(): Character {
  return {
    id: 'irma',
    name: 'Ирма Вейл',
    classes: [{ classId: 'rogue', level: 1 }],
    speciesId: 'halfling',
    backgroundId: 'criminal',
    abilityMethod: 'standard',
    baseAbilities: { str: 8, dex: 15, con: 14, int: 13, wis: 12, cha: 10 },
    backgroundBonuses: { dex: 2, int: 1 },
    choices: {
      // Навыки плута на выбор (4). Ловкость рук и Скрытность даёт предыстория.
      'class.rogue.prof.0': ['skill-acrobatics', 'skill-investigation', 'skill-perception', 'skill-deception'],
    },
    skillProficiencies: [],
    expertise: ['stealth', 'sleight-of-hand'],
    languages: ['common', 'halfling', 'elvish'],
    toolProficiencies: [],
    feats: [],
    weaponMasteries: ['shortsword', 'dagger'],
    equipment: [
      { itemId: 'leather-armor', quantity: 1, equipped: true },
      { itemId: 'shortsword', quantity: 1, equipped: true },
      { itemId: 'dagger', quantity: 2 },
      { itemId: 'shortbow', quantity: 1 },
      { itemId: 'arrows', quantity: 20 },
    ],
    coins: { gp: 8 },
    cantrips: [],
    preparedSpells: [],
    state: emptyGameState(),
    status: { kind: 'ready' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

/** Та же Ирма на 5-м уровне: подкласс «Вор», на 4-м уровне «Увеличение характеристик» ЛОВ +1, ТЕЛ +1. */
export function irmaLevel5(): Character {
  const c = irmaLevel1();
  return {
    ...c,
    classes: [{ classId: 'rogue', subclassId: 'thief', level: 5 }],
    feats: [{ featId: 'ability-score-improvement', source: 'class', level: 4, abilityIncreases: { dex: 1, con: 1 } }],
  };
}
