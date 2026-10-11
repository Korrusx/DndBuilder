import { content } from '@/content';
import { emptyGameState } from '../character';
import { formatDamage, formatDice, formatModifier, rollD20 } from '../dice';
import { applyDamage, applyHealing, longRest, setTempHp, spendHitDie } from '../rest';
import { spellAttackBonus, spellSaveDC, spellSlots, spellsKnown } from '../spells';

const cls = (id: string) => content.classes.find((c) => c.id === id)!;

describe('заклинания', () => {
  test('СЛ и бонус атаки', () => {
    expect(spellSaveDC(3, 2)).toBe(13);
    expect(spellAttackBonus(3, 2)).toBe(5);
  });
  test('ячейки из таблицы класса', () => {
    expect(spellSlots(cls('wizard'), 1)).toEqual([2, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(spellSlots(cls('wizard'), 3)).toEqual([4, 2, 0, 0, 0, 0, 0, 0, 0]);
    expect(spellSlots(cls('wizard'), 20)).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1]);
    expect(spellSlots(cls('rogue'), 5)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(spellsKnown(cls('wizard'), 3)).toEqual({ cantrips: 3, prepared: 6 });
  });
});

describe('кости', () => {
  test('показ', () => {
    expect(formatDice('2d6')).toBe('2к6');
    expect(formatModifier(5)).toBe('+5');
    expect(formatModifier(-1)).toBe('−1');
    expect(formatDamage('1d4', 3)).toBe('1к4+3');
    expect(formatDamage('1d8', 0)).toBe('1к8');
  });
  test('к20 с преимуществом и помехой', () => {
    const seq = (...v: number[]) => { let i = 0; return () => (v[i++] - 1) / 20; };
    expect(rollD20(4, 'advantage', seq(7, 15))).toMatchObject({ dice: [7, 15], keptIndex: 1, natural: 15, total: 19 });
    expect(rollD20(4, 'disadvantage', seq(7, 15))).toMatchObject({ keptIndex: 0, natural: 7, total: 11 });
    expect(rollD20(0, 'normal', seq(20))).toMatchObject({ dice: [20], natural: 20 });
  });
});

describe('состояние игры и отдых', () => {
  const base = { ...emptyGameState(), currentHp: 20 };

  test('урон сначала снимает временные хиты', () => {
    const s = applyDamage({ ...base, tempHp: 5 }, 8);
    expect(s).toMatchObject({ tempHp: 0, currentHp: 17 });
    expect(applyDamage(base, 50).currentHp).toBe(0);
  });

  test('лечение не выше максимума и сбрасывает спасброски от смерти', () => {
    const down = { ...base, currentHp: 0, deathSaves: { successes: 1, failures: 2 } };
    expect(applyHealing(down, 5, 38)).toMatchObject({ currentHp: 5, deathSaves: { successes: 0, failures: 0 } });
    expect(applyHealing(base, 50, 38).currentHp).toBe(38);
  });

  test('временные хиты не складываются', () => {
    expect(setTempHp({ ...base, tempHp: 5 }, 3).tempHp).toBe(5);
    expect(setTempHp({ ...base, tempHp: 5 }, 8).tempHp).toBe(8);
  });

  test('короткий отдых: кость хитов + ТЕЛ', () => {
    const s = spendHitDie({ ...base, currentHp: 10 }, 'rogue', 5, 4, 2, 38);
    expect(s).toMatchObject({ currentHp: 16, hitDiceSpent: { rogue: 1 } });
    const none = spendHitDie({ ...base, hitDiceSpent: { rogue: 5 } }, 'rogue', 5, 4, 2, 38);
    expect(none.currentHp).toBe(20);
  });

  test('долгий отдых', () => {
    const tired = {
      ...base,
      currentHp: 3,
      tempHp: 4,
      hitDiceSpent: { rogue: 5 },
      slotsSpent: [2, 1, 0, 0, 0, 0, 0, 0, 0],
      exhaustion: 2,
      heroicInspiration: true,
    };
    const s = longRest(tired, 38);
    expect(s).toMatchObject({ currentHp: 38, tempHp: 0, hitDiceSpent: {}, exhaustion: 1, heroicInspiration: true });
    expect(s.slotsSpent).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});
