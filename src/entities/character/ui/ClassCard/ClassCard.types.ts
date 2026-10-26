import type { ReactNode } from 'react';

import type { ClassDescription } from '../../model/types';

export type ClassCardProps = {
  description: ClassDescription;
  /** Место в конце карточки (позже — «Подробнее в альманахе»). */
  footer?: ReactNode;
};
