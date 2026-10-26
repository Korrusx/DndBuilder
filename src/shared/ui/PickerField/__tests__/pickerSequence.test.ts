import { pickerSequence } from '../pickerSequence';

describe('порядок разделов выбора заклинаний', () => {
  test('«Далее» открывает следующий раздел, у последнего — нет', () => {
    const setOpenKey = jest.fn();
    const step = pickerSequence(['cantrips', 'spells'], 'cantrips', setOpenKey);
    expect(step('cantrips').open).toBe(true);
    expect(step('spells').open).toBe(false);
    step('cantrips').onNext?.();
    expect(setOpenKey).toHaveBeenLastCalledWith('spells');
    expect(step('spells').onNext).toBeUndefined();
    step('spells').onClose();
    expect(setOpenKey).toHaveBeenLastCalledWith(null);
  });
});
