import type { ReactNode } from 'react';

export type SwipeRowProps = {
  children: ReactNode;
  /** Строку смахнули влево до конца. */
  onSwiped: () => void;
  /** Подпись под строкой, видна во время свайпа («Удалить»). */
  label: string;
};
