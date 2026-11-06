import type { TextContext } from '../../lib/cardText';
import type { LevelChoice, LevelUpCard } from '../../model/types';

export type DeckCardViewProps = {
  card: LevelUpCard;
  /** Уровень класса после повышения — для метки «ПЛУТ 6». */
  classLevel: number;
  context?: TextContext;
  /** Ячейки до и после — для кружков на карте магии. */
  slots?: { before: number[]; after: number[] };
  animate: boolean;
  onChoose?: (choice: LevelChoice) => void;
  /** Необязательный выбор пропущен («Не менять»). */
  kept?: boolean;
  onKeep?: (choice: LevelChoice) => void;
  /** Подсказка внизу карты («уже есть: Скрытность, Ловкость рук»). */
  note?: string;
};
