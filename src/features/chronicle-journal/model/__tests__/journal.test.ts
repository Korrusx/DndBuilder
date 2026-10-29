import { addToBalance, balanceEvents, isCoinsOnly } from '../coins';
import { isRecorded, parseJournalSettings, toggleGroup } from '../settings';

describe('настройки журнала', () => {
  test('по умолчанию записывается всё; выключенная группа не пишется, начало сессии — всегда', () => {
    const defaults = parseJournalSettings(null);
    expect(isRecorded(defaults, 'natural')).toBe(true);
    const noRolls = toggleGroup(defaults, 'rolls');
    expect(isRecorded(noRolls, 'natural')).toBe(false);
    expect(isRecorded(noRolls, 'loot')).toBe(true);
    expect(isRecorded(toggleGroup(noRolls, 'chronicle'), 'sessionStart')).toBe(true);
    expect(toggleGroup(noRolls, 'rolls')).toEqual({ disabled: [] });
  });

  test('испорченные и неизвестные значения не ломают настройки', () => {
    expect(parseJournalSettings('{not json')).toEqual({ disabled: [] });
    expect(parseJournalSettings('{"disabled":["rest","bogus"]}')).toEqual({ disabled: ['rest'] });
  });
});

describe('монеты копятся, пока игрок печатает', () => {
  test('«4» → «45» → стёр до «40»: одна запись «получено 40 зм»', () => {
    let balance = addToBalance({}, { type: 'loot', direction: 'gain', items: [], coins: { gp: 4 } });
    balance = addToBalance(balance, { type: 'loot', direction: 'gain', items: [], coins: { gp: 41 } });
    balance = addToBalance(balance, { type: 'loot', direction: 'loss', items: [], coins: { gp: 5 } });
    expect(balanceEvents(balance)).toEqual([{ type: 'loot', direction: 'gain', items: [], coins: { gp: 40 } }]);
  });

  test('размен золота на серебро — и получено, и потрачено; вернул как было — ничего', () => {
    const swap = addToBalance(addToBalance({}, { type: 'loot', direction: 'loss', items: [], coins: { gp: 1 } }), {
      type: 'loot',
      direction: 'gain',
      items: [],
      coins: { sp: 10 },
    });
    expect(balanceEvents(swap)).toEqual([
      { type: 'loot', direction: 'gain', items: [], coins: { sp: 10 } },
      { type: 'loot', direction: 'loss', items: [], coins: { gp: 1 } },
    ]);
    const back = addToBalance(addToBalance({}, { type: 'loot', direction: 'gain', items: [], coins: { gp: 3 } }), {
      type: 'loot',
      direction: 'loss',
      items: [],
      coins: { gp: 3 },
    });
    expect(balanceEvents(back)).toEqual([]);
  });

  test('копятся только монеты, предметы пишутся сразу', () => {
    expect(isCoinsOnly({ type: 'loot', direction: 'gain', items: [], coins: { gp: 1 } })).toBe(true);
    expect(
      isCoinsOnly({ type: 'loot', direction: 'gain', items: [{ itemId: 'dagger', quantity: 1 }], coins: {} }),
    ).toBe(false);
    expect(isCoinsOnly({ type: 'down' })).toBe(false);
  });
});
