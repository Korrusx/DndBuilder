import type { RefObject } from 'react';
import type { ViewInstance } from 'react-native';

export type LevelBadgeProps = {
  level: number;
  capstone?: boolean;
  /** Пока кольцо ритуала летит сюда, значок скрыт: в конце они совпадают. */
  hidden?: boolean;
  /** Ссылка на значок — для измерения положения на экране. */
  badgeRef?: RefObject<ViewInstance | null>;
  onLayout?: () => void;
};
