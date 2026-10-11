import type { ReactNode } from 'react';

export type OptionCardProps = {
  title: ReactNode;
  lines?: ReactNode[];
  selected?: boolean;
  /** Без обработчика — просто карточка с информацией. */
  onPress?: () => void;
  compact?: boolean;
};
