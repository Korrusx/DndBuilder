import type { PickerScreenProps } from '../PickerScreen/PickerScreen.types';

/** Состояние раздела выбора: открыт ли его экран и куда ведёт «Далее». */
export type PickerStep = { open: boolean; onOpen: () => void; onClose: () => void; onNext?: () => void };

export type PickerFieldProps = Omit<PickerScreenProps, 'visible' | 'onClose' | 'title'> & {
  /** Заголовок раздела и экрана выбора. */
  title: string;
  hint?: string;
  /** Сколько нужно выбрать для счётчика раздела (по умолчанию — `max`). */
  need?: number;
  /** Подпись кнопки, открывающей выбор. */
  buttonLabel?: string;
  /** Открыт ли экран выбора; без этого поля раздел управляет им сам. */
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};
