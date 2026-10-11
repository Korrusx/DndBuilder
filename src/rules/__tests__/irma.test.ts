import { content } from '@/content';
import { computeSheet } from '../sheet';
import { formatDamage, formatModifier } from '../dice';
import { irmaLevel1, irmaLevel5 } from '../samples';

const skill = (sheet: ReturnType<typeof computeSheet>, id: string) => sheet.skills.find((s) => s.id === id)!;
const attack = (sheet: ReturnType<typeof computeSheet>, id: string) => {
  const a = sheet.attacks.find((x) => x.itemId === id)!;
  return { toHit: formatModifier(a.toHit), damage: formatDamage(a.damageDice, a.damageBonus) };
};

describe('Ирма Вейл, плут 1', () => {
  const sheet = computeSheet(irmaLevel1(), content);

  test('характеристики с бонусами предыстории', () => {
    expect(sheet.abilities.dex).toMatchObject({ score: 17, mod: 3 });
    expect(sheet.abilities.int).toMatchObject({ score: 14, mod: 2 });
  });

  test('главные числа', () => {
    expect(sheet.maxHp).toBe(10);
    expect(sheet.armorClass).toBe(14);
    expect(sheet.initiative).toBe(5); // ЛОВ +3 и БМ +2 от черты «Бдительность»
    expect(sheet.profBonus).toBe(2);
    expect(sheet.passivePerception).toBe(13);
    expect(sheet.speed).toBe(30);
  });

  test('спасброски', () => {
    expect(sheet.abilities.dex.save).toBe(5);
    expect(sheet.abilities.int.save).toBe(4);
    expect(sheet.abilities.str).toMatchObject({ save: -1, saveProficient: false });
  });

  test('навыки', () => {
    expect(skill(sheet, 'stealth')).toMatchObject({ bonus: 7, expertise: true });
    expect(skill(sheet, 'sleight-of-hand')).toMatchObject({ bonus: 7, expertise: true });
    expect(skill(sheet, 'acrobatics').bonus).toBe(5);
    expect(skill(sheet, 'investigation').bonus).toBe(4);
    expect(skill(sheet, 'perception').bonus).toBe(3);
    expect(skill(sheet, 'deception').bonus).toBe(2);
    expect(skill(sheet, 'athletics')).toMatchObject({ bonus: -1, proficient: false });
  });

  test('атаки', () => {
    expect(attack(sheet, 'shortsword')).toEqual({ toHit: '+5', damage: '1к6+3' });
    expect(attack(sheet, 'dagger')).toEqual({ toHit: '+5', damage: '1к4+3' });
    expect(attack(sheet, 'shortbow')).toEqual({ toHit: '+5', damage: '1к6+3' });
  });

  test('скрытая атака 1к6, не заклинатель', () => {
    expect(sheet.classSpecific.rogue.sneak_attack).toEqual({ dice_count: 1, dice_value: 6 });
    expect(sheet.spellcasting).toBeUndefined();
  });

  test('что умеет: умения класса, особенности вида, черта предыстории', () => {
    const ids = sheet.features.map((f) => f.id);
    expect(ids).toEqual(expect.arrayContaining(['rogue-sneak-attack', 'rogue-expertise', 'luck', 'brave', 'alert']));
    expect(sheet.features.find((f) => f.id === 'alert')?.source).toBe('feat');
  });
});

describe('Ирма Вейл, плут 5', () => {
  const sheet = computeSheet(irmaLevel5(), content);

  test('главные числа', () => {
    expect(sheet.abilities.dex).toMatchObject({ score: 18, mod: 4 });
    expect(sheet.maxHp).toBe(38);
    expect(sheet.profBonus).toBe(3);
    expect(sheet.initiative).toBe(7);
    expect(sheet.armorClass).toBe(15);
  });

  test('скрытая атака 3к6', () => {
    expect(sheet.classSpecific.rogue.sneak_attack).toEqual({ dice_count: 3, dice_value: 6 });
  });

  test('умения подкласса до 5-го уровня', () => {
    const ids = sheet.features.filter((f) => f.source === 'subclass').map((f) => f.id);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(content.features.find((f) => f.id === id)!.level).toBeLessThanOrEqual(5);
  });
});
