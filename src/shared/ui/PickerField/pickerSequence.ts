import type { PickerStep } from './PickerField.types';

/**
 * Разделы выбора заклинаний по порядку: «Далее» на экране выбора открывает следующий раздел,
 * у последнего кнопка «Готово» возвращает в шаг.
 */
export function pickerSequence(keys: string[], openKey: string | null, setOpenKey: (key: string | null) => void) {
  return (key: string): PickerStep => {
    const next = keys[keys.indexOf(key) + 1];
    return {
      open: openKey === key,
      onOpen: () => setOpenKey(key),
      onClose: () => setOpenKey(null),
      onNext: next ? () => setOpenKey(next) : undefined,
    };
  };
}
