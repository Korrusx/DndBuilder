import type { PickedItem } from '../../model/types';

export type PickedChipsProps = {
  items: PickedItem[];
  /** Цвета карты магии и кружок круга заклинания. */
  magic?: boolean;
  /** «Изменить» — снова открыть экран выбора. */
  onChange: () => void;
};
