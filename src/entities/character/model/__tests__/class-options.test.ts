import { content } from '@/shared/content';

import { CHOICE_KEYS } from '../../config/constants';
import { irmaLevel1 } from '../../lib/samples';
import { classOptionChoices, classOptionSlots, classOptionSpells, tomeSlots, unmetClassOptions } from '../classOptions';

const warlock = (level: number, invocations: string[] = [], cantrips: string[] = []) => ({
  ...irmaLevel1(),
  classes: [{ classId: 'warlock', level }],
  cantrips,
  choices: { [CHOICE_KEYS.classOptions('invocation')]: invocations },
});
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe('таинственные воззвания', () => {
  test('в справочнике 28 воззваний и 10 вариантов метамагии из SRD 5.2', () => {
    expect(content.classOptions.filter((o) => o.kind === 'invocation')).toHaveLength(28);
    expect(content.classOptions.filter((o) => o.kind === 'metamagic')).toHaveLength(10);
  });

  test('число воззваний по таблице колдуна: 1 на 1-м уровне, 3 на 2-м, 5 на 5-м', () => {
    expect(classOptionSlots(warlock(1), content)).toEqual([expect.objectContaining({ kind: 'invocation', count: 1 })]);
    expect(classOptionSlots(warlock(2), content)[0].count).toBe(3);
    expect(classOptionSlots(warlock(5), content)[0].count).toBe(5);
    expect(classOptionSlots(irmaLevel1(), content)).toEqual([]);
  });

  test('на 1-м уровне — только воззвания без условий', () => {
    expect(ids(classOptionChoices(warlock(1), content, 'invocation'))).toEqual([
      'armor-of-shadows',
      'eldritch-mind',
      'pact-of-the-blade',
      'pact-of-the-chain',
      'pact-of-the-tome',
    ]);
  });

  test('«Мучительный взрыв» — со 2-го уровня и только с заговором колдуна, наносящим урон', () => {
    expect(ids(classOptionChoices(warlock(2), content, 'invocation'))).not.toContain('agonizing-blast');
    expect(ids(classOptionChoices(warlock(2, [], ['eldritch-blast']), content, 'invocation'))).toContain(
      'agonizing-blast',
    );
  });

  test('«Жаждущий клинок» требует «Договора клинка»; без него выбор считается невыполненным', () => {
    expect(ids(classOptionChoices(warlock(5), content, 'invocation'))).not.toContain('thirsting-blade');
    expect(ids(classOptionChoices(warlock(5, ['pact-of-the-blade']), content, 'invocation'))).toContain(
      'thirsting-blade',
    );
    expect(unmetClassOptions(warlock(5, ['thirsting-blade']), content)).toEqual(['thirsting-blade']);
    expect(unmetClassOptions(warlock(5, ['pact-of-the-blade', 'thirsting-blade']), content)).toEqual([]);
  });

  test('заклинания от воззваний и Книги теней', () => {
    const c = warlock(1, ['pact-of-the-tome']);
    const tome = tomeSlots(c, content)!;
    expect(tome.cantrips.count).toBe(3);
    expect(tome.rituals.count).toBe(2);
    expect(tome.rituals.options).toContain('find-familiar'); // ритуал 1-го круга из любого списка
    const withBook = { ...c, choices: { ...c.choices, [CHOICE_KEYS.tomeRituals]: ['find-familiar'] } };
    expect(classOptionSpells(withBook, content)).toEqual([
      expect.objectContaining({ spellId: 'find-familiar', free: 'tome' }),
    ]);
    expect(classOptionSpells(warlock(1, ['armor-of-shadows']), content)).toEqual([
      expect.objectContaining({ spellId: 'mage-armor', free: 'atWill' }),
    ]);
    expect(tomeSlots(warlock(1, ['pact-of-the-blade']), content)).toBeNull();
  });
});

describe('метамагия', () => {
  const sorcerer = (level: number) => ({ ...irmaLevel1(), classes: [{ classId: 'sorcerer', level }] });
  test('2 варианта со 2-го уровня, 4 с 10-го, 6 с 17-го; на 1-м — нет', () => {
    expect(classOptionSlots(sorcerer(1), content)).toEqual([]);
    expect(classOptionSlots(sorcerer(2), content)[0]).toMatchObject({ kind: 'metamagic', count: 2 });
    expect(classOptionSlots(sorcerer(10), content)[0].count).toBe(4);
    expect(classOptionSlots(sorcerer(17), content)[0].count).toBe(6);
    expect(classOptionChoices(sorcerer(2), content, 'metamagic')).toHaveLength(10);
  });
});
