import { choiceButton } from '../choiceButton';
import type { DetailChoice } from '../DetailSheet.types';

const choice = (selected: string[], max: number, reason?: (id: string) => string | undefined): DetailChoice => ({
  isSelected: (id) => selected.includes(id),
  reason,
  picked: selected.length,
  max,
  onToggle: () => {},
});

describe('кнопка выбора в шторке', () => {
  test('выбранный вариант можно убрать', () => {
    expect(choiceButton('a', choice(['a'], 3))).toMatchObject({ title: 'Убрать из выбранных', disabled: false });
  });

  test('лимит исчерпан — кнопка недоступна с подсказкой', () => {
    expect(choiceButton('d', choice(['a', 'b', 'c'], 3))).toMatchObject({
      title: 'Выбрать',
      disabled: true,
      note: 'Выбрано 3 из 3 — сначала уберите другое',
    });
  });

  test('выбор одного варианта заменяет прежний', () => {
    expect(choiceButton('b', choice(['a'], 1))).toMatchObject({ title: 'Выбрать', disabled: false });
  });

  test('недоступный вариант — с причиной', () => {
    expect(
      choiceButton(
        'a',
        choice([], 2, () => 'уже выбрано'),
      ),
    ).toMatchObject({ disabled: true, note: 'уже выбрано' });
  });
});
