import { content } from '@/shared/content';

import { spellDamage, spellDamageLevels } from '../spells';

const spell = (id: string) => content.spells.find((s) => s.id === id)!;

describe('урон заклинаний', () => {
  test('заговоры растут на 5, 11 и 17 уровне персонажа', () => {
    expect(spellDamage(spell('fire-bolt'), 1)).toEqual({ dice: '1d10' });
    expect(spellDamage(spell('fire-bolt'), 4)).toEqual({ dice: '1d10' });
    expect(spellDamage(spell('fire-bolt'), 5)).toEqual({ dice: '2d10' });
    expect(spellDamage(spell('fire-bolt'), 17)).toEqual({ dice: '4d10' });
  });

  test('«Мистический заряд»: больше лучей, а не костей', () => {
    expect(spellDamage(spell('eldritch-blast'), 1)).toEqual({ dice: '1d10', beams: 1 });
    expect(spellDamage(spell('eldritch-blast'), 11)).toEqual({ dice: '1d10', beams: 3 });
  });

  test('заклинания растут с кругом ячейки', () => {
    expect(spellDamage(spell('fireball'), 5)).toEqual({ dice: '8d6' });
    expect(spellDamage(spell('fireball'), 9, 5)).toEqual({ dice: '10d6' });
    expect(spellDamageLevels(spell('fireball'), 5)).toEqual([3, 4, 5]);
    expect(spellDamage(spell('shatter'), 3, 3)).toEqual({ dice: '4d8' });
  });

  test('без урона в справочнике — null', () => {
    expect(spellDamage(spell('cure-wounds'), 1)).toBeNull();
  });
});
