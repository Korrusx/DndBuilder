import type { ReactNode, RefObject } from 'react';
import type { ViewInstance } from 'react-native';

import type { DeckProgress } from '../../model/types';

export type DeckHeaderProps = {
  /** «Новое на 5-м уровне». */
  title: string;
  /** «Каэлан · паладин · драконорождённый». */
  subtitle: string;
  progress: DeckProgress;
  onBack: () => void;
  onRevealAll: () => void;
  /** Новый общий уровень — значок в шапке. */
  level: number;
  capstone?: boolean;
  /** Значок скрыт, пока в него летит кольцо ритуала. */
  badgeHidden?: boolean;
  badgeRef?: RefObject<ViewInstance | null>;
  onBadgeLayout?: () => void;
  /** Переход из ритуала: заголовок проявляется 300–500 мс, счётчик 500–650. */
  intro?: boolean;
  /** Лента колоды под счётчиком. */
  children?: ReactNode;
};
