import { setActiveEdition } from '@/shared/content';

import { d20Parts } from '../d20Parts';

describe('слагаемые к20 и истощение', () => {
  afterEach(() => setActiveEdition('2024'));

  test('2024: −2 за уровень истощения', () => {
    expect(d20Parts([{ label: 'ЛОВ', value: 3 }], 2).map((p) => p.value)).toEqual([3, -4]);
  });

  test('2014: истощение даёт помеху, а не штраф', () => {
    setActiveEdition('2014');
    expect(d20Parts([{ label: 'ЛОВ', value: 3 }], 2).map((p) => p.value)).toEqual([3]);
  });
});
