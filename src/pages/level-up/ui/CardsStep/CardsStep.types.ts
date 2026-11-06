import type { Deck, LevelChoice, LevelSnapshot, TextContext } from '@/features/level-up';

export type CardsStepProps = {
  deck: Deck;
  before: LevelSnapshot;
  after: LevelSnapshot;
  /** Новый общий уровень — для «Новое на 6-м уровне». */
  level: number;
  /** Уровень повышаемого класса — для метки «ПЛУТ 6». */
  classLevel: number;
  current: number;
  onCurrent: (index: number) => void;
  onReveal: (ids: string[]) => void;
  onChoose: (choice: LevelChoice) => void;
  onKeep: (choice: LevelChoice) => void;
  kept: string[];
  animate: boolean;
  context: TextContext;
  /** Подсказки под картой («уже есть: …») по id карты. */
  notes: Record<string, string>;
};
