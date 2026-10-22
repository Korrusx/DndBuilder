import { contentFor } from '@/shared/content';
import { formatDamage, formatModifier } from '@/shared/lib/dice';

import { irma2014Level1, irma2014Level5 } from '../../lib/samples';
import { expertiseCount, knownLanguages } from '../build';
import { computeSheet } from '../sheet';

const content = contentFor('2014');

const skill = (sheet: ReturnType<typeof computeSheet>, id: string) => sheet.skills.find((s) => s.id === id)!;
const attack = (sheet: ReturnType<typeof computeSheet>, id: string) => {
  const a = sheet.attacks.find((x) => x.itemId === id)!;
  return { toHit: formatModifier(a.toHit), damage: formatDamage(a.damageDice, a.damageBonus) };
};

describe('Ирма Вейл 2014, плут 1 (SRD 5.1)', () => {
  const sheet = computeSheet(irma2014Level1(), content);

  test('прибавки расы и подрасы: ЛОВ +2, ХАР +1; ИНТ без прибавки', () => {
    expect(sheet.abilities.dex).toMatchObject({ score: 17, mod: 3 });
    expect(sheet.abilities.cha).toMatchObject({ score: 11, mod: 0 });
    expect(sheet.abilities.int).toMatchObject({ score: 13, mod: 1 });
  });

  test('главные числа: без «Бдительности» инициатива = ЛОВ, скорость полурослика 25', () => {
    expect(sheet.maxHp).toBe(10);
    expect(sheet.armorClass).toBe(14);
    expect(sheet.initiative).toBe(3);
    expect(sheet.profBonus).toBe(2);
    expect(sheet.passivePerception).toBe(13);
    expect(sheet.speed).toBe(25);
  });

  test('спасброски', () => {
    expect(sheet.abilities.dex.save).toBe(5);
    expect(sheet.abilities.int.save).toBe(3);
  });

  test('навыки', () => {
    expect(skill(sheet, 'stealth')).toMatchObject({ bonus: 7, expertise: true });
    expect(skill(sheet, 'sleight-of-hand')).toMatchObject({ bonus: 7, expertise: true });
    expect(skill(sheet, 'acrobatics').bonus).toBe(5);
    expect(skill(sheet, 'investigation').bonus).toBe(3);
    expect(skill(sheet, 'perception').bonus).toBe(3);
    expect(skill(sheet, 'deception').bonus).toBe(2);
  });

  test('атаки', () => {
    expect(attack(sheet, 'shortsword')).toEqual({ toHit: '+5', damage: '1к6+3' });
    expect(attack(sheet, 'dagger')).toEqual({ toHit: '+5', damage: '1к4+3' });
    expect(attack(sheet, 'shortbow')).toEqual({ toHit: '+5', damage: '1к6+3' });
  });

  test('скрытая атака 1к6; умения класса и расы; черт нет', () => {
    expect(sheet.classSpecific.rogue.sneak_attack).toEqual({ dice_count: 1, dice_value: 6 });
    const ids = sheet.features.map((f) => f.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'sneak-attack',
        'rogue-expertise-1',
        'thieves-cant',
        'lucky',
        'brave',
        'naturally-stealthy',
      ]),
    );
    expect(sheet.features.some((f) => f.source === 'feat')).toBe(false);
  });

  test('компетентность плута на 1-м уровне — 2; языки расы', () => {
    expect(expertiseCount(irma2014Level1(), content)).toBe(2);
    expect(knownLanguages(irma2014Level1(), content)).toEqual(['common', 'halfling']);
  });
});

describe('Ирма Вейл 2014, плут 5', () => {
  const sheet = computeSheet(irma2014Level5(), content);

  test('главные числа', () => {
    expect(sheet.abilities.dex).toMatchObject({ score: 18, mod: 4 });
    expect(sheet.maxHp).toBe(38);
    expect(sheet.profBonus).toBe(3);
    expect(sheet.initiative).toBe(4);
    expect(sheet.armorClass).toBe(15);
  });

  test('скрытая атака 3к6, атака коротким мечом +7', () => {
    expect(sheet.classSpecific.rogue.sneak_attack).toEqual({ dice_count: 3, dice_value: 6 });
    expect(attack(sheet, 'shortsword')).toEqual({ toHit: '+7', damage: '1к6+4' });
  });

  test('умения архетипа «Вор» с 3-го уровня', () => {
    const ids = sheet.features.filter((f) => f.source === 'subclass').map((f) => f.id);
    expect(ids).toEqual(['fast-hands', 'second-story-work']);
  });
});
