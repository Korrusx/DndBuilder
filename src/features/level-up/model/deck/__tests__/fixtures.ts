// Персонажи для тестов колоды. Числа в тестах — из данных приложения (assets/content).

import type { Character, FeatChoice } from '@/entities/character';
import { irmaLevel1, newDraftCharacter, setClass } from '@/entities/character';

const asi = (level: number, abilityIncreases: FeatChoice['abilityIncreases']): FeatChoice => ({
  featId: 'ability-score-improvement',
  source: 'class',
  level,
  abilityIncreases,
});

/** Ирма Вейл, плут (Вор): на 4-м «Увеличение характеристик» ЛОВ +1, ТЕЛ +1 (как в levelup.test.ts). */
export function irmaAt(level: number): Character {
  return {
    ...irmaLevel1(),
    classes: [{ classId: 'rogue', subclassId: 'thief', level }],
    feats: level >= 4 ? [asi(4, { dex: 1, con: 1 })] : [],
    expertise: level >= 6 ? ['stealth', 'sleight-of-hand', 'acrobatics', 'perception'] : ['stealth', 'sleight-of-hand'],
  };
}

/** Ирма 7-го уровня с ТЕЛ 14 (на 4-м — ЛОВ +2) — для улучшения ТЕЛ 14 → 16 на 8-м. */
export function irmaCon14At7(): Character {
  return { ...irmaAt(7), feats: [asi(4, { dex: 2 })] };
}

/** Персонаж 2024 указанного класса (база Ирмы, другие характеристики). */
export function hero(classId: string, level: number, extra: Partial<Character> = {}): Character {
  return {
    ...setClass(irmaLevel1(), classId),
    baseAbilities: { str: 15, dex: 12, con: 14, int: 13, wis: 15, cha: 14 },
    backgroundBonuses: {},
    classes: [{ classId, level }],
    weaponMasteries: [],
    ...extra,
  };
}

/** Лира, жрица (Домен жизни): 4 заговора, 7 подготовленных — полный набор 4-го уровня. */
export function liraAt4(): Character {
  return hero('cleric', 4, {
    name: 'Лира',
    classes: [{ classId: 'cleric', subclassId: 'life-domain', level: 4 }],
    cantrips: ['sacred-flame', 'guidance', 'light', 'thaumaturgy'],
    preparedSpells: ['bless', 'cure-wounds', 'guiding-bolt', 'healing-word', 'command', 'aid', 'augury'],
  });
}

/** Драконорождённый (красный предок) паладин Клятвы преданности. */
export function dragonbornPaladin(classes: Character['classes']): Character {
  return hero('paladin', 1, { speciesId: 'dragonborn', subspeciesId: 'draconic-ancestor-red', classes });
}

/** Персонаж 2014 (SRD 5.1): человек-послушник, все характеристики 14. */
export function hero2014(classId: string, level: number, extra: Partial<Character> = {}): Character {
  return {
    ...newDraftCharacter('t', 'now', '2014'),
    name: 'Тест',
    speciesId: 'human',
    backgroundId: 'acolyte',
    baseAbilities: { str: 14, dex: 14, con: 14, int: 14, wis: 14, cha: 14 },
    classes: [{ classId, level }],
    status: { kind: 'ready' },
    ...extra,
  };
}
