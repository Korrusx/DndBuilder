import { content } from '@/shared/content';

import { irmaLevel1 } from '../../lib/samples';
import { spellSummary } from '../spellSummary';

const spell = (id: string) => content.spells.find((s) => s.id === id)!;
const atLevel = (level: number) => {
  const irma = irmaLevel1();
  return { ...irma, classes: irma.classes.map((entry) => ({ ...entry, level })) };
};

describe('сводка заклинания', () => {
  test('«Огненный снаряд»: урон, атака, дистанция; урон растёт с уровнем персонажа', () => {
    expect(spellSummary(spell('fire-bolt'), content).text).toBe('1к10 огнём · атака · 120 фт');
    expect(spellSummary(spell('fire-bolt'), content, atLevel(1)).text).toBe('1к10 огнём · атака · 120 фт');
    expect(spellSummary(spell('fire-bolt'), content, atLevel(5)).text).toBe('2к10 огнём · атака · 120 фт');
  });

  test('заклинание со спасброском и областью', () => {
    expect(spellSummary(spell('burning-hands'), content).text).toBe('3к6 огнём · СЛ спасброска ЛОВ · конус 15 фт');
    expect(spellSummary(spell('sacred-flame'), content, atLevel(5)).text).toBe(
      '2к8 излучением · СЛ спасброска ЛОВ · 60 фт',
    );
  });

  test('без урона: спасбросок и дистанция; лечение', () => {
    expect(spellSummary(spell('command'), content).text).toBe('СЛ спасброска МДР · 60 фт');
    expect(spellSummary(spell('cure-wounds'), content).text).toBe('лечение 2к8 + мод. · Касание');
  });

  test('без данных: краткое описание из перевода, иначе школа и время накладывания', () => {
    expect(spellSummary(spell('bless'), content)).toEqual({ text: 'Очарование · Действие', tags: ['concentration'] });
    const withShort = {
      ...spell('guidance'),
      short: { en: '+1d4 to an ally’s check', ru: '+1к4 к проверке союзника' },
    };
    expect(spellSummary(withShort, content).text).toBe('+1к4 к проверке союзника');
  });

  test('метки: концентрация и ритуал', () => {
    expect(spellSummary(spell('detect-magic'), content).tags).toEqual(['concentration', 'ritual']);
    expect(spellSummary(spell('fire-bolt'), content).tags).toEqual([]);
  });
});
