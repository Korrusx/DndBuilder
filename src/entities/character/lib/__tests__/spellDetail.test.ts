import { content } from '@/shared/content';

import { irmaLevel5 } from '../samples';
import { spellDetail } from '../spellDetail';

const spell = (id: string) => content.spells.find((s) => s.id === id)!;

describe('описание заклинания для шторки', () => {
  test('«Огненный снаряд»: круг и школа, плитки, урон по уровню персонажа', () => {
    const detail = spellDetail(spell('fire-bolt'), content);
    expect(detail.title).toBe('Огненный снаряд');
    expect(detail.subtitle).toBe('Заговор · Воплощение');
    expect(detail.tiles).toEqual([
      { label: 'Время', value: 'Действие' },
      { label: 'Дистанция', value: '120 фт' },
      { label: 'Компоненты', value: 'В, С' },
      { label: 'Длительность', value: 'Мгновенная' },
      { label: 'Урон', value: '1к10 огнём' },
    ]);
    expect(spellDetail(spell('fire-bolt'), content, irmaLevel5()).tiles?.at(-1)?.value).toBe('2к10 огнём');
  });

  test('область — к дистанции, метки и рост по кругам', () => {
    const detail = spellDetail(spell('burning-hands'), content);
    expect(detail.tiles?.[1]).toEqual({ label: 'Дистанция', value: 'На себя, конус 15 фт' });
    expect(detail.sections?.[0]?.title).toBe('На более высоких кругах');
    expect(spellDetail(spell('detect-magic'), content).tags).toEqual(['Концентрация', 'Ритуал']);
  });

  test('лечение — плитка «Эффект»', () => {
    expect(spellDetail(spell('cure-wounds'), content).tiles?.at(-1)).toEqual({
      label: 'Эффект',
      value: 'лечение 2к8 + мод.',
    });
  });
});
