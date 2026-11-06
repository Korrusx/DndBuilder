import type { ReactNode } from 'react';

export type JumpingBackProps = {
  /** Меняется — анимация У1 началась заново, карта подпрыгнет в свой момент. */
  playKey: number;
  index: number;
  /** Сколько рубашек в ряду (поворот −3°, 0°, +3° для первой, средней и последней). */
  count: number;
  animate: boolean;
  capstone: boolean;
  children: ReactNode;
};
