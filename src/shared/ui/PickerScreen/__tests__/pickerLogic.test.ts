import type { PickFilter, PickItem } from '../PickerScreen.types';
import { filterPickItems, togglePick } from '../pickerLogic';

const items: PickItem[] = [
  { id: 'fire-bolt', title: 'Огненный снаряд', search: 'Fire Bolt', filters: ['damage', 'circle-0'] },
  { id: 'guidance', title: 'Указание', search: 'Guidance', filters: ['support', 'concentration', 'circle-0'] },
  { id: 'cure-wounds', title: 'Лечение ран', search: 'Cure Wounds', filters: ['heal', 'circle-1'] },
  { id: 'bless', title: 'Благословение', search: 'Bless', filters: ['support', 'concentration', 'circle-1'] },
];
const filters: PickFilter[] = [
  { key: 'damage', label: 'урон', group: 'kind' },
  { key: 'heal', label: 'лечение', group: 'kind' },
  { key: 'support', label: 'поддержка', group: 'kind' },
  { key: 'concentration', label: 'К', group: 'concentration' },
  { key: 'circle-0', label: 'заговор', group: 'circle' },
  { key: 'circle-1', label: '1 круг', group: 'circle' },
];
const ids = (list: PickItem[]) => list.map((item) => item.id);

describe('поиск и фильтры выбора', () => {
  test('поиск по названию на любом языке, без учёта регистра', () => {
    expect(ids(filterPickItems(items, 'огнен', [], filters))).toEqual(['fire-bolt']);
    expect(ids(filterPickItems(items, 'BLESS', [], filters))).toEqual(['bless']);
  });

  test('внутри группы — «или», между группами — «и»', () => {
    expect(ids(filterPickItems(items, '', ['damage', 'heal'], filters))).toEqual(['fire-bolt', 'cure-wounds']);
    expect(ids(filterPickItems(items, '', ['support', 'circle-1'], filters))).toEqual(['bless']);
    expect(ids(filterPickItems(items, '', ['concentration'], filters))).toEqual(['guidance', 'bless']);
  });
});

describe('выбор варианта', () => {
  test('снять, добавить, заменить единственный, упереться в лимит', () => {
    expect(togglePick(['a', 'b'], 'a', 2)).toEqual(['b']);
    expect(togglePick(['a'], 'b', 2)).toEqual(['a', 'b']);
    expect(togglePick(['a'], 'b', 1)).toEqual(['b']);
    expect(togglePick(['a', 'b'], 'c', 2)).toEqual(['a', 'b']);
  });
});
