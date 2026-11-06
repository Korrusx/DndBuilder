import type { ReactNode } from 'react';

import type { DeckProgress } from '../../model/types';

export type DeckHeaderProps = {
  /** «Новое на 5-м уровне». */
  title: string;
  /** «Каэлан · паладин · драконорождённый». */
  subtitle: string;
  progress: DeckProgress;
  onBack: () => void;
  onRevealAll: () => void;
  /** Лента колоды под счётчиком. */
  children?: ReactNode;
};
