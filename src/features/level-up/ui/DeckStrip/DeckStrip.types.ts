import type { LevelUpCard } from '../../model/types';

export type DeckStripProps = {
  cards: LevelUpCard[];
  /** Текущая карта; `cards.length` — «Итог». */
  current: number;
  onSelect: (index: number) => void;
};
