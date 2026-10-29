import { irmaLevel1, irmaLevel5 } from '../../lib/samples';
import { characterEvents } from '../events';
import type { Character } from '../types';

const irma = (): Character => ({ ...irmaLevel5(), coins: { gp: 60 } });
const withState = (character: Character, state: Partial<Character['state']>): Character => ({
  ...character,
  state: { ...character.state, ...state },
});

describe('события персонажа для летописи', () => {
  test('хиты упали до 0', () => {
    const before = withState(irma(), { currentHp: 5 });
    expect(characterEvents(before, withState(before, { currentHp: 0 }))).toEqual([{ type: 'down' }]);
    expect(characterEvents(before, withState(before, { currentHp: 2 }))).toEqual([]);
  });

  test('стабилизация и смерть по спасброскам', () => {
    const dying = withState(irma(), { currentHp: 0, deathSaves: { successes: 2, failures: 2 } });
    expect(characterEvents(dying, withState(dying, { deathSaves: { successes: 3, failures: 2 } }))).toEqual([
      { type: 'stabilized' },
    ]);
    expect(characterEvents(dying, withState(dying, { deathSaves: { successes: 2, failures: 3 } }))).toEqual([
      { type: 'died' },
    ]);
  });

  test('новый уровень: общий уровень и уровень выросшего класса', () => {
    expect(characterEvents(irmaLevel1(), irmaLevel5())).toContainEqual({
      type: 'level',
      level: 5,
      classId: 'rogue',
      classLevel: 5,
    });
  });

  test('монеты: получено и потрачено отдельно', () => {
    const before = irma();
    expect(characterEvents(before, { ...before, coins: { gp: 105, sp: 0 } })).toEqual([
      { type: 'loot', direction: 'gain', items: [], coins: { gp: 45 } },
    ]);
    expect(characterEvents({ ...before, coins: { gp: 60, sp: 3 } }, { ...before, coins: { gp: 48, sp: 13 } })).toEqual([
      { type: 'loot', direction: 'gain', items: [], coins: { sp: 10 } },
      { type: 'loot', direction: 'loss', items: [], coins: { gp: 12 } },
    ]);
  });

  test('предметы: найден свой ключ, продан кинжал; надеть из рюкзака — не событие', () => {
    const before: Character = { ...irma(), equipment: [{ itemId: 'dagger', quantity: 2 }], equippedSlots: {} };
    const after: Character = {
      ...before,
      equipment: [
        { itemId: 'dagger', quantity: 1 },
        { itemId: 'custom:key', name: 'ключ с якорем', quantity: 1 },
      ],
    };
    expect(characterEvents(before, after)).toEqual([
      {
        type: 'loot',
        direction: 'gain',
        items: [{ itemId: 'custom:key', name: 'ключ с якорем', quantity: 1 }],
        coins: {},
      },
      { type: 'loot', direction: 'loss', items: [{ itemId: 'dagger', quantity: 1 }], coins: {} },
    ]);
    const equipped: Character = {
      ...before,
      equipment: [{ itemId: 'dagger', quantity: 1 }],
      equippedSlots: { main: 'dagger' },
    };
    expect(characterEvents(before, equipped)).toEqual([]);
  });
});
