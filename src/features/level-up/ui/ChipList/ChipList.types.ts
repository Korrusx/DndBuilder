import type { ReactNode } from 'react';

export type ChipListProps = {
  /** Чипы по порядку. Больше шести — видны первые пять и «+N ещё». */
  children: ReactNode[];
  /** Цвет текста «+N ещё» (`accent` типа карты). */
  moreColor: string;
  /** Высота чипа «+N ещё» — как у соседних чипов. */
  height?: number;
};
