import type { PickItem } from '../PickerScreen/PickerScreen.types';

export type PickerRowProps = {
  item: PickItem;
  selected: boolean;
  disabled: boolean;
  /** Обработчики получают id строки — так они одни на весь список и не мешают memo. */
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
};
