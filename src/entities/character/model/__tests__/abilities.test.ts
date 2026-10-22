import {
  abilityModifier,
  applyIncreases,
  isStandardArray,
  pointBuyCost,
  pointBuySpent,
  proficiencyBonus,
  roll4d6DropLowest,
  validateBackgroundBonuses,
} from '../abilities';

const scores = (str: number, dex: number, con: number, int: number, wis: number, cha: number) => ({
  str,
  dex,
  con,
  int,
  wis,
  cha,
});

test('модификатор характеристики', () => {
  expect([1, 3, 8, 9, 10, 11, 12, 15, 17, 18, 20, 30].map(abilityModifier)).toEqual([
    -5, -4, -1, -1, 0, 0, 1, 2, 3, 4, 5, 10,
  ]);
});

test('бонус мастерства по уровням', () => {
  const byLevel = Array.from({ length: 20 }, (_, i) => proficiencyBonus(i + 1));
  expect(byLevel).toEqual([2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]);
});

test('прибавки не поднимают выше 20', () => {
  const r = applyIncreases(scores(8, 19, 14, 13, 12, 10), { dex: 2 }, { con: 1 });
  expect(r.dex).toBe(20);
  expect(r.con).toBe(15);
});

test('покупка очков', () => {
  expect([8, 9, 10, 11, 12, 13, 14, 15].map(pointBuyCost)).toEqual([0, 1, 2, 3, 4, 5, 7, 9]);
  expect(pointBuyCost(7)).toBeUndefined();
  expect(pointBuyCost(16)).toBeUndefined();
  expect(pointBuySpent(scores(15, 15, 15, 8, 8, 8))).toBe(27);
  expect(pointBuySpent(scores(8, 15, 14, 13, 12, 10))).toBe(27);
  expect(pointBuySpent(scores(16, 8, 8, 8, 8, 8))).toBeUndefined();
});

test('стандартный набор', () => {
  expect(isStandardArray(scores(8, 15, 14, 13, 12, 10))).toBe(true);
  expect(isStandardArray(scores(15, 15, 14, 13, 12, 10))).toBe(false);
});

test('4к6 без меньшей кости', () => {
  const values = [0.99, 0.0, 0.5, 0.2]; // → 6, 1, 4, 2
  let i = 0;
  const r = roll4d6DropLowest(() => values[i++]);
  expect(r.dice).toEqual([6, 1, 4, 2]);
  expect(r.droppedIndex).toBe(1);
  expect(r.total).toBe(12);
});

describe('бонусы предыстории', () => {
  const allowed = ['dex', 'con', 'int'] as const;
  test('+2/+1 и +1/+1/+1 допустимы', () => {
    expect(validateBackgroundBonuses({ dex: 2, int: 1 }, [...allowed])).toEqual([]);
    expect(validateBackgroundBonuses({ dex: 1, con: 1, int: 1 }, [...allowed])).toEqual([]);
  });
  test('ошибки', () => {
    expect(validateBackgroundBonuses({ str: 2, dex: 1 }, [...allowed])).toHaveLength(1);
    expect(validateBackgroundBonuses({ dex: 3 }, [...allowed])).toHaveLength(1);
    expect(validateBackgroundBonuses({ dex: 2, con: 2 }, [...allowed])).toHaveLength(1);
    expect(validateBackgroundBonuses({}, [...allowed])).toHaveLength(1);
  });
});
