import type { ReactNode } from 'react';

export type JumpingBackProps = {
  /** Меняется — карта подпрыгивает (после смены цифры уровня). */
  jumpKey: number;
  index: number;
  animate: boolean;
  children: ReactNode;
};
