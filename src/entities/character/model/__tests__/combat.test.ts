import type { ArmorInfo, Equipment } from '@/shared/content';

import { armorClass, bonusHpFromEffects, initiative, maxHitPoints, weaponAttack } from '../combat';
import { effectsOf } from '../effects';

const mods = { str: 3, dex: 2, con: 1, int: 0, wis: 3, cha: -1 };
const armor = (category: ArmorInfo['category'], base: number, dexBonus: boolean, maxDex?: number): ArmorInfo => ({
  category,
  base,
  dexBonus,
  maxDex,
  strMinimum: 0,
  stealthDisadvantage: false,
});
const shield = armor('shield', 2, false);

describe('класс защиты', () => {
  test('без доспеха 10 + ЛОВ', () => expect(armorClass({ mods, effects: [] })).toBe(12));
  test('лёгкий: база + ЛОВ', () => expect(armorClass({ armor: armor('light', 11, true), mods, effects: [] })).toBe(13));
  test('средний: ЛОВ не больше +2', () => {
    expect(armorClass({ armor: armor('medium', 14, true, 2), mods: { ...mods, dex: 4 }, effects: [] })).toBe(16);
  });
  test('тяжёлый: только база', () =>
    expect(armorClass({ armor: armor('heavy', 16, false), mods, effects: [] })).toBe(16));
  test('щит +2', () => expect(armorClass({ armor: armor('heavy', 16, false), shield, mods, effects: [] })).toBe(18));
  test('варвар: 10 + ЛОВ + ТЕЛ, щит можно', () => {
    const effects = effectsOf(['barbarian-unarmored-defense']);
    expect(armorClass({ mods, effects })).toBe(13);
    expect(armorClass({ shield, mods, effects })).toBe(15);
  });
  test('монах: 10 + ЛОВ + МДР, со щитом не работает', () => {
    const effects = effectsOf(['monk-unarmored-defense']);
    expect(armorClass({ mods, effects })).toBe(15);
    expect(armorClass({ shield, mods, effects })).toBe(14);
  });
  test('стиль «Оборона»: +1 только в доспехе', () => {
    const effects = effectsOf(['defense']);
    expect(armorClass({ armor: armor('light', 11, true), mods, effects })).toBe(14);
    expect(armorClass({ mods, effects })).toBe(12);
  });
  test('Кованый, «Встроенная защита»: +1 и в доспехе, и без него', () => {
    const effects = effectsOf(['integrated-protection']);
    expect(armorClass({ mods, effects })).toBe(13);
    expect(armorClass({ armor: armor('heavy', 16, false), shield, mods, effects })).toBe(19);
    expect(armorClass({ mods, effects: [...effects, ...effectsOf(['monk-unarmored-defense'])] })).toBe(16);
  });
});

describe('хиты', () => {
  test('1-й уровень: максимум кости + ТЕЛ', () => expect(maxHitPoints([{ hitDie: 8, level: 1 }], 2)).toBe(10));
  test('дальше среднее', () => expect(maxHitPoints([{ hitDie: 8, level: 5 }], 2)).toBe(38));
  test('мультикласс: максимум только у первого класса', () => {
    // воин 1 (10+1) + волшебник 2 (2 × (4+1))
    expect(
      maxHitPoints(
        [
          { hitDie: 10, level: 1 },
          { hitDie: 6, level: 2 },
        ],
        1,
      ),
    ).toBe(21);
  });
  test('дварфийская стойкость и драконья устойчивость', () => {
    expect(bonusHpFromEffects(effectsOf(['dwarven-toughness']), 4, {})).toBe(4);
    const draconic = effectsOf(['draconic-sorcery-draconic-resilience']);
    expect(bonusHpFromEffects(draconic, 3, { sorcerer: 3 })).toBe(3);
    expect(bonusHpFromEffects(draconic, 6, { sorcerer: 6 })).toBe(6);
  });
});

test('инициатива', () => {
  expect(initiative(3, 2, [])).toBe(3);
  expect(initiative(3, 2, effectsOf(['alert']))).toBe(5);
});

describe('атака оружием', () => {
  const weapon = (range: 'melee' | 'ranged', properties: string[]): Equipment => ({
    id: 'w',
    name: { en: 'W' },
    categories: [],
    cost: { amount: 1, unit: 'gp' },
    weapon: { category: 'simple', range, damage: { dice: '1d6', type: 'piercing' }, reach: { normal: 5 }, properties },
  });
  test('рукопашное — СИЛ', () => {
    expect(weaponAttack(weapon('melee', []), mods, 2, true)).toMatchObject({
      ability: 'str',
      toHit: 5,
      damageBonus: 3,
    });
  });
  test('дальнобойное — ЛОВ', () => {
    expect(weaponAttack(weapon('ranged', []), mods, 2, true)).toMatchObject({
      ability: 'dex',
      toHit: 4,
      damageBonus: 2,
    });
  });
  test('фехтовальное — лучшая из СИЛ и ЛОВ', () => {
    expect(weaponAttack(weapon('melee', ['finesse']), { ...mods, dex: 4 }, 2, true)).toMatchObject({
      ability: 'dex',
      toHit: 6,
    });
    expect(weaponAttack(weapon('melee', ['finesse']), mods, 2, true)).toMatchObject({ ability: 'str', toHit: 5 });
  });
  test('без владения БМ не добавляется', () => {
    expect(weaponAttack(weapon('melee', []), mods, 2, false)?.toHit).toBe(3);
  });
});
