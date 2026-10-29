import { searchEntities } from '../search';
import { entity } from './fixtures';

const boris = entity('boris', 'Борис');
const forest = entity('forest', 'Каменный бор', 'place');
const lab = entity('lab', 'Лаборатория', 'place');
const petr = entity('petr', 'Пётр');
const all = [lab, forest, petr, boris];

describe('поиск карточек', () => {
  test('«бор» и «Бор» находят Бориса первым: сначала начало имени, потом слово, потом середина', () => {
    expect(searchEntities('бор', all).map((found) => found.id)).toEqual(['boris', 'forest', 'lab']);
    expect(searchEntities('Бор', all)[0]).toBe(boris);
  });

  test('ё и е не различаются', () => {
    expect(searchEntities('петр', all)).toEqual([petr]);
    expect(searchEntities('ПЁ', all)).toEqual([petr]);
  });

  test('пустой запрос — все карточки', () => {
    expect(searchEntities('  ', all)).toHaveLength(4);
  });
});
