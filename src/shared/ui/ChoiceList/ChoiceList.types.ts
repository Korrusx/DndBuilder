import type { DetailContent } from '../DetailSheet/DetailSheet.types';
import type { PickItem } from '../PickerScreen/PickerScreen.types';

export type ChoiceListProps = {
  items: PickItem[];
  selected: string[];
  max: number;
  onChange: (ids: string[]) => void;
  detail: (id: string) => DetailContent | null;
  /** Варианты не выбирают, а добавляют (предметы): «+» в строке, «Добавить» в шторке. */
  onAdd?: (id: string) => void;
};
