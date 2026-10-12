import { content } from '@/shared/content';

import { CHOICE_KEYS } from '../../config/constants';
import { irmaLevel1 } from '../../lib/samples';
import { featureLanguageSlots, knownLanguages } from '../build';
import { computeSheet } from '../sheet';

const skill = (c: ReturnType<typeof irmaLevel1>, id: string) => computeSheet(c, content).skills.find((s) => s.id === id)!;

describe('языки от умений класса', () => {
  test('плут: воровской жаргон и ещё один язык на выбор, в том числе редкий', () => {
    const irma = irmaLevel1(); // плут; языки: Общий, полуросликов, эльфийский
    const [slot] = featureLanguageSlots(irma, content);
    expect(slot).toMatchObject({ featureId: 'rogue-thieves-cant', choose: 1 });
    expect(slot.options).toContain('abyssal'); // редкий язык можно
    expect(slot.options).not.toContain('elvish'); // уже знает
    expect(slot.options).not.toContain('thieves-cant'); // уже даётся умением
    expect(knownLanguages(irma, content)).toContain('thieves-cant');

    const chosen = { ...irma, choices: { ...irma.choices, [CHOICE_KEYS.featureLanguages('rogue-thieves-cant')]: ['abyssal'] } };
    expect(knownLanguages(chosen, content)).toEqual(expect.arrayContaining(['common', 'halfling', 'elvish', 'thieves-cant', 'abyssal']));
    expect(featureLanguageSlots(chosen, content)[0].options).toContain('abyssal'); // свой выбор остаётся в списке
  });

  test('друид: друидический без выбора; у других классов языков от класса нет', () => {
    const druid = { ...irmaLevel1(), classes: [{ classId: 'druid', level: 1 }] };
    expect(knownLanguages(druid, content)).toContain('druidic');
    expect(featureLanguageSlots(druid, content)).toEqual([]);
    const fighter = { ...irmaLevel1(), classes: [{ classId: 'fighter', level: 1 }] };
    expect(knownLanguages(fighter, content)).toEqual(['common', 'elvish', 'halfling']);
  });
});

describe('«Чудотворец» и «Волхв»: + мод. МДР к проверкам (минимум +1)', () => {
  const cleric = (option?: string, wis = 12) => ({
    ...irmaLevel1(),
    classes: [{ classId: 'cleric', level: 1 }],
    baseAbilities: { ...irmaLevel1().baseAbilities, wis },
    choices: option ? { [CHOICE_KEYS.featureOption('cleric-divine-order')]: [option] } : {},
  });

  test('Чудотворец: Магия и Религия +1 при МДР 12, История без изменений', () => {
    const plain = cleric('protector');
    const thaum = cleric('thaumaturge');
    expect(skill(thaum, 'arcana').bonus).toBe(skill(plain, 'arcana').bonus + 1);
    expect(skill(thaum, 'religion').bonus).toBe(skill(plain, 'religion').bonus + 1);
    expect(skill(thaum, 'religion').extra).toBe(1);
    expect(skill(thaum, 'history').bonus).toBe(skill(plain, 'history').bonus);
  });

  test('при МДР 8 бонус всё равно +1', () => {
    expect(skill(cleric('thaumaturge', 8), 'arcana').extra).toBe(1);
  });

  test('Волхв: Магия и Природа', () => {
    const druid = {
      ...irmaLevel1(),
      classes: [{ classId: 'druid', level: 1 }],
      baseAbilities: { ...irmaLevel1().baseAbilities, wis: 16 },
      choices: { [CHOICE_KEYS.featureOption('druid-primal-order')]: ['magician'] },
    };
    expect(skill(druid, 'nature').extra).toBe(3);
    expect(skill(druid, 'arcana').extra).toBe(3);
    expect(skill(druid, 'religion').extra).toBe(0);
  });
});
