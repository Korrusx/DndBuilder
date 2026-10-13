import { content } from '@/shared/content';

import { irmaLevel1 } from '../../lib/samples';
import { newDraftCharacter } from '../character';
import { characterSummary, hpLevel } from '../summary';

describe('сводка для карточки', () => {
  test('готовый персонаж', () => {
    const irma = irmaLevel1();
    irma.state.currentHp = 7;
    const s = characterSummary(irma, content);
    expect(s).toMatchObject({ letter: 'И', level: 1, hp: { current: 7, max: 10 }, armorClass: 14 });
    expect(s.classNames.map((n) => n.en)).toEqual(['Rogue']);
    expect(s.species?.en).toBe('Halfling');
    expect(s.background?.en).toBe('Criminal');
  });

  test('пустой черновик не падает и не показывает числа', () => {
    const s = characterSummary(newDraftCharacter('x', '2026-01-01T00:00:00.000Z'), content);
    expect(s).toEqual({ letter: '?', level: 0, classNames: [], classLevels: [], species: undefined, background: undefined });
  });

  test('мультикласс: уровни классов и общий уровень', () => {
    const s = characterSummary({ ...irmaLevel1(), classes: [{ classId: 'rogue', level: 3 }, { classId: 'wizard', level: 2 }] }, content);
    expect(s.level).toBe(5);
    expect(s.classLevels).toEqual([3, 2]);
    expect(s.classNames.map((n) => n.ru)).toEqual(['Плут', 'Волшебник']);
  });

  test('цвет полосы хитов', () => {
    expect(hpLevel(6, 10)).toBe('good');
    expect(hpLevel(5, 10)).toBe('warn');
    expect(hpLevel(3, 10)).toBe('warn');
    expect(hpLevel(2, 10)).toBe('danger');
    expect(hpLevel(0, 0)).toBe('danger');
  });
});
