import { content } from '@/shared/content';

import { spellDamage, spellDamageLevels } from '../spells';

const spell = (id: string) => content.spells.find((s) => s.id === id)!;

describe('урон заклинаний', () => {
  test('заговоры растут на 5, 11 и 17 уровне персонажа', () => {
    expect(spellDamage(spell('fire-bolt'), 1)).toMatchObject({ dice: '1d10', bonus: 0 });
    expect(spellDamage(spell('fire-bolt'), 4)?.dice).toBe('1d10');
    expect(spellDamage(spell('fire-bolt'), 5)?.dice).toBe('2d10');
    expect(spellDamage(spell('fire-bolt'), 17)?.dice).toBe('4d10');
  });

  test('«Мистический заряд»: больше лучей, а не костей', () => {
    expect(spellDamage(spell('eldritch-blast'), 1)).toMatchObject({ dice: '1d10', beams: 1 });
    expect(spellDamage(spell('eldritch-blast'), 11)).toMatchObject({ dice: '1d10', beams: 3 });
  });

  test('заклинания растут с кругом ячейки', () => {
    expect(spellDamage(spell('fireball'), 5)?.dice).toBe('8d6');
    expect(spellDamage(spell('fireball'), 9, 5)?.dice).toBe('10d6');
    expect(spellDamageLevels(spell('fireball'), 5)).toEqual([3, 4, 5]);
    expect(spellDamage(spell('shatter'), 3, 3)?.dice).toBe('4d8');
  });

  test('урон из текста SRD (srd/spell-damage.json)', () => {
    // «Волшебная стрела»: 3 дротика по 1к4 + 1, ячейкой 3-го круга — 5 дротиков.
    expect(spellDamage(spell('magic-missile'), 1)).toMatchObject({ dice: '3d4', bonus: 3, count: 3 });
    expect(spellDamage(spell('magic-missile'), 5, 3)).toMatchObject({ dice: '5d4', bonus: 5, count: 5 });
    expect(spellDamage(spell('chromatic-orb'), 1, 2)).toMatchObject({ dice: '4d8', chosenType: true });
    expect(spellDamage(spell('disintegrate'), 11, 7)).toMatchObject({ dice: '13d6', bonus: 40 });
    expect(spellDamage(spell('spiritual-weapon'), 3)).toMatchObject({ dice: '1d8', addModifier: true });
    expect(spellDamage(spell('sorcerous-burst'), 5)?.dice).toBe('2d8');
  });

  test('лечение и временные хиты', () => {
    expect(spellDamage(spell('cure-wounds'), 1)).toMatchObject({ dice: '2d8', kind: 'heal', addModifier: true });
    expect(spellDamage(spell('cure-wounds'), 3, 2)?.dice).toBe('4d8');
    expect(spellDamage(spell('false-life'), 3, 2)).toMatchObject({ dice: '2d4', bonus: 9, kind: 'tempHp' });
  });

  test('без урона в справочнике — null', () => {
    expect(spellDamage(spell('bless'), 1)).toBeNull();
  });
});
