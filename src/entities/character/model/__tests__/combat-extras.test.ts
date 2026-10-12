import { content } from '@/shared/content';

import { irmaLevel1 } from '../../lib/samples';
import { emptyGameState } from '../character';
import { weaponAttack } from '../combat';
import { divineSmiteDice, endRage, finishShortRest, rollDamage, startRage, unarmedStrike } from '../play';
import { longRest } from '../rest';
import { computeSheet } from '../sheet';

const item = (id: string) => content.equipment.find((e) => e.id === id)!;
const mods = { str: 3, dex: 1, con: 2, int: 0, wis: 0, cha: 0 };
const attackOf = (sheet: ReturnType<typeof computeSheet>, key: string) => sheet.attacks.find((a) => a.key === key)!;

describe('стиль «Стрельба»', () => {
  test('Ирма с «Стрельбой»: короткий лук +7 вместо +5, кинжал без изменений', () => {
    const irma = { ...irmaLevel1(), feats: [{ featId: 'archery', source: 'class' as const, level: 1 }] };
    const sheet = computeSheet(irma, content);
    expect(attackOf(sheet, 'shortbow').toHit).toBe(7);
    expect(attackOf(sheet, 'shortbow').damageBonus).toBe(3);
    expect(attackOf(sheet, 'dagger').toHit).toBe(5);
  });
});

describe('стиль «Сражение большим оружием»', () => {
  test('двуручное — всегда, универсальное — только двумя руками, дальнобойное — нет', () => {
    const opts = { greatWeaponMinDie: 3 };
    expect(weaponAttack(item('greatsword'), mods, 2, true, opts)?.damageMinDie).toBe(3);
    const longsword = weaponAttack(item('longsword'), mods, 2, true, opts);
    expect(longsword?.damageMinDie).toBeUndefined();
    expect(longsword?.twoHanded).toEqual({ dice: '1d10', minDie: 3 });
    expect(weaponAttack(item('longbow'), mods, 2, true, opts)?.damageMinDie).toBeUndefined();
  });

  test('без стиля у универсального оружия всё равно есть урон двумя руками', () => {
    expect(weaponAttack(item('longsword'), mods, 2, true)?.twoHanded).toEqual({ dice: '1d10', minDie: undefined });
  });

  test('1 и 2 на кости считаются за 3', () => {
    const roll = rollDamage('2d6', 3, false, () => 0, 3); // rng 0 → на кости 1
    expect(roll.dice).toEqual([3, 3]);
    expect(roll.total).toBe(9);
    expect(rollDamage('2d6', 3, false, () => 0).total).toBe(5);
  });
});

describe('магическое оружие', () => {
  test('кинжал +1: попадание и урон +1, обычный кинжал остаётся отдельной атакой', () => {
    const irma = irmaLevel1();
    const withMagic = { ...irma, equipment: [...irma.equipment, { itemId: 'dagger', quantity: 1, magicBonus: 1 }] };
    const sheet = computeSheet(withMagic, content);
    expect(attackOf(sheet, 'dagger').toHit).toBe(5);
    expect(attackOf(sheet, 'dagger+1').toHit).toBe(6);
    expect(attackOf(sheet, 'dagger+1').damageBonus).toBe(4);
  });
});

describe('ярость', () => {
  const barbarian = (raging: boolean) => ({
    ...irmaLevel1(),
    classes: [{ classId: 'barbarian', level: 1 }],
    equipment: [
      { itemId: 'greataxe', quantity: 1 },
      { itemId: 'shortbow', quantity: 1 },
    ],
    state: { ...emptyGameState(), raging },
  });

  test('+2 к урону атак Силой на 1-м уровне, дальнобойное (Ловкость) — без бонуса', () => {
    const calm = computeSheet(barbarian(false), content);
    const angry = computeSheet(barbarian(true), content);
    expect(calm.rageDamage).toBe(0);
    expect(angry.rageDamage).toBe(2);
    expect(attackOf(angry, 'greataxe').damageBonus).toBe(attackOf(calm, 'greataxe').damageBonus + 2);
    expect(attackOf(angry, 'shortbow').damageBonus).toBe(attackOf(calm, 'shortbow').damageBonus);
    expect(unarmedStrike(-1, 2, angry.rageDamage).damage).toBe(2);
  });

  test('не варвар — бонуса нет, даже если отмечена ярость', () => {
    expect(computeSheet({ ...irmaLevel1(), state: { ...emptyGameState(), raging: true } }, content).rageDamage).toBe(0);
  });

  test('вход тратит использование; без использований войти нельзя; отдых заканчивает ярость', () => {
    const s = startRage(emptyGameState(), 2)!;
    expect(s.raging).toBe(true);
    expect(s.resourcesSpent.rage).toBe(1);
    expect(startRage({ ...s, resourcesSpent: { rage: 2 } }, 2)).toBeNull();
    expect(endRage(s).raging).toBe(false);
    expect(finishShortRest(s, false).raging).toBe(false);
    expect(longRest(s, 10).raging).toBe(false);
  });
});

describe('«Божественная кара»', () => {
  test('2к8 ячейкой 1-го круга, +1к8 за круг выше и против исчадий и нежити', () => {
    expect(divineSmiteDice(1, false)).toBe('2d8');
    expect(divineSmiteDice(2, false)).toBe('3d8');
    expect(divineSmiteDice(3, true)).toBe('5d8');
  });
});
