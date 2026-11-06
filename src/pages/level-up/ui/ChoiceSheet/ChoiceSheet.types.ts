import type { Character } from '@/entities/character';
import type { LevelChoice } from '@/features/level-up';

export type ChoiceSheetProps = {
  /** Открытый выбор; null — шторка закрыта. */
  choice: LevelChoice | null;
  prev: Character;
  next: Character;
  set: (fn: (c: Character) => Character) => void;
  onClose: () => void;
};
