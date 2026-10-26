import type { ReactNode } from 'react';

export type FadeSwapProps = {
  /** При смене значения содержимое коротко проявляется заново. */
  swapKey: string;
  children: ReactNode;
};
