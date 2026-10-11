import { content } from '@/content';
import { emptyGameState, type GameState } from '../character';
import {
  adjustSlot,
  castSpell,
  deathSave,
  deathStatus,
  exhaustionPenalty,
  finishShortRest,
  lowestFreeSlot,
  rollDamage,
  setExhaustion,
  speedWithExhaustion,
  toggleCondition,
  toggleEquipped,
  addToInventory,
  unarmedStrike,
} from '../play';
import { applyDamage } from '../rest';

const at = (hp: number, extra: Partial<GameState> = {}): GameState => ({ ...emptyGameState(), currentHp: hp, ...extra });

/** Генератор «случайных» чисел, выдающий заданные значения кости. */
const dice = (sides: number, ...values: number[]) => {
  let i = 0;
  return () => (values[i++] - 1) / sides;
};

describe('смерть и спасброски от смерти', () => {
  test('урон на 0 хитов — провал, критическое попадание — два', () => {
    expect(applyDamage(at(0), 3, 10).deathSaves.failures).toBe(1);
    expect(applyDamage(at(0), 3, 10, true).deathSaves.failures).toBe(2);
  });

  test('мгновенная смерть: остаток урона не меньше максимума хитов', () => {
    expect(deathStatus(applyDamage(at(6), 16, 10))).toBe('dead');
    expect(deathStatus(applyDamage(at(6), 15, 10))).toBe('dying');
  });

  test('бросок спасброска', () => {
    expect(deathSave(at(0), 10).deathSaves).toEqual({ successes: 1, failures: 0 });
    expect(deathSave(at(0), 9).deathSaves).toEqual({ successes: 0, failures: 1 });
    expect(deathSave(at(0), 1).deathSaves).toEqual({ successes: 0, failures: 2 });
    const up = deathSave(at(0, { deathSaves: { successes: 2, failures: 2 } }), 20);
    expect(up).toMatchObject({ currentHp: 1, deathSaves: { successes: 0, failures: 0 } });
    expect(deathStatus(deathSave(at(0, { deathSaves: { successes: 2, failures: 0 } }), 15))).toBe('stable');
    expect(deathStatus(deathSave(at(0, { deathSaves: { successes: 0, failures: 2 } }), 5))).toBe('dead');
    // Штраф истощения учитывается в итоге.
    expect(deathSave(at(0), 11, 7).deathSaves).toEqual({ successes: 0, failures: 1 });
    // Живой персонаж спасбросков не делает.
    expect(deathSave(at(5), 3)).toEqual(at(5));
  });
});

describe('истощение и состояния', () => {
  test('штрафы истощения', () => {
    expect(exhaustionPenalty(2)).toBe(-4);
    expect(speedWithExhaustion(30, 2)).toBe(20);
    expect(speedWithExhaustion(25, 6)).toBe(0);
    expect(setExhaustion(at(5), 9).exhaustion).toBe(6);
    expect(setExhaustion(at(5), -1).exhaustion).toBe(0);
  });

  test('состояния включаются и выключаются', () => {
    const s = toggleCondition(at(5), 'prone');
    expect(s.conditions).toEqual(['prone']);
    expect(toggleCondition(s, 'prone').conditions).toEqual([]);
  });
});

describe('ячейки и заклинания', () => {
  const slots = [4, 2, 0, 0, 0, 0, 0, 0, 0];

  test('потратить и вернуть ячейку в пределах максимума', () => {
    let s = adjustSlot(at(5), 2, 1, slots);
    s = adjustSlot(s, 2, 5, slots);
    expect(s.slotsSpent[1]).toBe(2);
    expect(adjustSlot(s, 2, -3, slots).slotsSpent[1]).toBe(0);
  });

  test('сотворение тратит самую низкую подходящую ячейку', () => {
    const s = at(5, { slotsSpent: [4, 0, 0, 0, 0, 0, 0, 0, 0] });
    expect(lowestFreeSlot(s, 1, slots)).toBe(2);
    expect(castSpell(s, 1, slots)).toMatchObject({ slotLevel: 2, state: { slotsSpent: [4, 1, 0, 0, 0, 0, 0, 0, 0] } });
    expect(castSpell(at(5, { slotsSpent: [4, 2, 0, 0, 0, 0, 0, 0, 0] }), 1, slots)).toBeNull();
    expect(castSpell(s, 0, slots)).toEqual({ state: s, slotLevel: 0 });
    // Нельзя сотворить ячейкой ниже круга заклинания.
    expect(castSpell(at(5), 2, slots, 1)).toBeNull();
  });

  test('колдун восстанавливает ячейки на коротком отдыхе', () => {
    const s = at(5, { slotsSpent: [1, 0, 0, 0, 0, 0, 0, 0, 0] });
    expect(finishShortRest(s, true).slotsSpent[0]).toBe(0);
    expect(finishShortRest(s, false).slotsSpent[0]).toBe(1);
  });
});

describe('броски урона', () => {
  test('обычный и критический', () => {
    expect(rollDamage('1d6', 3, false, dice(6, 4))).toEqual({ dice: [4], sides: 6, bonus: 3, total: 7 });
    expect(rollDamage('1d6', 3, true, dice(6, 4, 6))).toEqual({ dice: [4, 6], sides: 6, bonus: 3, total: 13 });
    expect(rollDamage('1d4', -3, false, dice(4, 1)).total).toBe(0);
  });

  test('безоружный удар Ирмы (СИЛ −1, БМ +2)', () => {
    expect(unarmedStrike(-1, 2)).toEqual({ toHit: 1, damage: 0 });
  });
});

describe('вещи', () => {
  test('надевается только один доспех и один щит', () => {
    const items = [
      { itemId: 'leather-armor', quantity: 1, equipped: true },
      { itemId: 'chain-shirt', quantity: 1 },
      { itemId: 'shield', quantity: 1 },
      { itemId: 'dagger', quantity: 2, equipped: true },
    ];
    const next = toggleEquipped(items, 1, content);
    expect(next.map((i) => !!i.equipped)).toEqual([false, true, false, true]);
    const withShield = toggleEquipped(next, 2, content);
    expect(withShield.map((i) => !!i.equipped)).toEqual([false, true, true, true]);
    expect(toggleEquipped(withShield, 3, content)[3].equipped).toBe(false);
  });
});

test('добавление предмета: одинаковые складываются, свои — отдельно', () => {
  const items = [{ itemId: 'dagger', quantity: 2 }];
  expect(addToInventory(items, { itemId: 'dagger', quantity: 1 })).toEqual([{ itemId: 'dagger', quantity: 3 }]);
  expect(addToInventory(items, { itemId: 'bag-of-holding', quantity: 1 })).toHaveLength(2);
  const custom = { itemId: 'custom:a', quantity: 1, name: 'Письмо барона' };
  expect(addToInventory([custom], { ...custom })).toHaveLength(2);
});
