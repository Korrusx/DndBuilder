import { content } from '@/shared/content';

import { CHOICE_KEYS } from '../../config/constants';
import { irmaLevel1 } from '../../lib/samples';
import { spellOptions } from '../build';
import {
  hasSpellbook,
  preparableSpells,
  setSpellbook,
  spellbook,
  spellbookMinimum,
  spellbookOptions,
} from '../spellbook';

const level1 = spellOptions('wizard', 1, content);
const book6 = level1.slice(0, 6);
const wizard = (level = 1, book?: string[], prepared: string[] = []) => ({
  ...irmaLevel1(),
  classes: [{ classId: 'wizard', level }],
  preparedSpells: prepared,
  choices: (book ? { [CHOICE_KEYS.spellbook]: book } : {}) as Record<string, string[]>,
});

describe('книга заклинаний волшебника', () => {
  test('только у волшебника; 6 заклинаний на 1-м уровне и по 2 за следующие', () => {
    expect(hasSpellbook(irmaLevel1())).toBe(false);
    expect(spellbookMinimum(wizard(1))).toBe(6);
    expect(spellbookMinimum(wizard(3))).toBe(10);
  });

  test('готовить можно только из книги; у других классов — весь список', () => {
    const c = wizard(1, book6);
    expect(preparableSpells(c, content, 'wizard', 1)).toEqual(book6);
    expect(preparableSpells(c, content, 'cleric', 1)).toEqual(spellOptions('cleric', 1, content));
  });

  test('вписать в книгу можно только круги, для которых есть ячейки', () => {
    expect(spellbookOptions(wizard(1), content, 1)).toEqual(level1);
    expect(spellbookOptions(wizard(1), content, 2)).toEqual([]);
    expect(spellbookOptions(wizard(3), content, 2).length).toBeGreaterThan(0);
  });

  test('если убрать заклинание из книги, оно перестаёт быть подготовленным', () => {
    const c = wizard(1, book6, book6.slice(0, 4));
    const next = setSpellbook(c, book6.slice(1), content);
    expect(next.preparedSpells).toEqual(book6.slice(1, 4));
    expect(spellbook(next)).toEqual(book6.slice(1));
  });

  test('у волшебника, созданного до появления книги, в ней подготовленные заклинания', () => {
    expect(spellbook(wizard(1, undefined, book6.slice(0, 4)))).toEqual(book6.slice(0, 4));
  });
});
