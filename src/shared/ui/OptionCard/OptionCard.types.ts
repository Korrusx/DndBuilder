import type { ReactNode } from 'react';

import type { GameIconName } from '../GameIcon/GameIcon.types';

export type OptionCardProps = {
  title: ReactNode;
  lines?: ReactNode[];
  selected?: boolean;
  /** Без обработчика — просто карточка с информацией. */
  onPress?: () => void;
  compact?: boolean;
  /** Иконка слева от заголовка (game-icons.net); у выбранной карточки — акцентная. */
  icon?: GameIconName;
};
