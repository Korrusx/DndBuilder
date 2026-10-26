import { content } from '@/shared/content';

import { spellOptions } from '../../model/build';
import { spellPickFilters, spellPickItems } from '../spellPick';

describe('список заклинаний для выбора', () => {
  test('сначала по кругу, внутри круга — по названию; сводка и метки', () => {
    const items = spellPickItems(['bless', 'fire-bolt', 'cure-wounds', 'guidance'], content);
    expect(items.map((item) => item.id)).toEqual(['fire-bolt', 'guidance', 'bless', 'cure-wounds']);
    expect(items[0]).toMatchObject({ title: 'Огненный снаряд', summary: '1к10 огнём · атака · 120 фт', tags: [] });
    expect(items[1].tags).toEqual(['К']);
  });

  test('фильтры: вид, концентрация, круг; поиск по английскому названию', () => {
    const items = spellPickItems(['fire-bolt', 'cure-wounds', 'bless', 'detect-magic'], content);
    const byId = new Map(items.map((item) => [item.id, item]));
    expect(byId.get('fire-bolt')?.filters).toEqual(['damage', 'circle-0']);
    expect(byId.get('cure-wounds')?.filters).toEqual(['heal', 'circle-1']);
    expect(byId.get('detect-magic')?.filters).toEqual(['support', 'concentration', 'ritual', 'circle-1']);
    expect(byId.get('fire-bolt')?.search).toContain('Fire Bolt');
    expect(spellPickFilters(items).map((filter) => filter.key)).toEqual([
      'damage',
      'heal',
      'support',
      'concentration',
      'ritual',
      'circle-0',
      'circle-1',
    ]);
  });

  test('в списке одного круга фильтра по кругу нет', () => {
    const items = spellPickItems(spellOptions('wizard', 0, content), content);
    expect(spellPickFilters(items).some((filter) => filter.group === 'circle')).toBe(false);
  });

  test('уже выбранное в другом месте — с причиной', () => {
    const items = spellPickItems(['fire-bolt'], content, 1, new Map([['fire-bolt', 'уже выбрано']]));
    expect(items[0].reason).toBe('уже выбрано');
  });
});
