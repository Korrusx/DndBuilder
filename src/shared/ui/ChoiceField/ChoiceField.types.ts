import type { PickerFieldProps } from '../PickerField/PickerField.types';
import type { ChoiceEntry } from '../PickerScreen/PickerScreen.types';

export type ChoiceFieldProps = Omit<PickerFieldProps, 'items' | 'detail'> & {
  /** Варианты вместе с описаниями для шторки. */
  entries: ChoiceEntry[];
};
