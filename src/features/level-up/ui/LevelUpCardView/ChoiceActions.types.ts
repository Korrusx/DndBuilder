import type { LevelChoice, PickedItem } from '../../model/types';

export type ChoiceActionsProps = {
  choice: LevelChoice;
  picked: PickedItem[];
  kept: boolean;
  /** Подпись большой кнопки до выбора («Выбрать…», «Выбрать заклинания»). */
  chooseTitle: string;
  magic?: boolean;
  animate: boolean;
  onChoose: (choice: LevelChoice) => void;
  onKeep: (choice: LevelChoice) => void;
};
