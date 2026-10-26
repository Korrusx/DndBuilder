import type { ReactNode } from 'react';

export type FreezeProps = {
  /** true — содержимое не перерисовывается (состояние и прокрутка сохраняются). */
  freeze: boolean;
  children: ReactNode;
};
