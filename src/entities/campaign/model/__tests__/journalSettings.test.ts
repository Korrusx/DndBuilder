import { isRecorded, parseJournalSettings, toggleGroup } from '../journalSettings';

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
