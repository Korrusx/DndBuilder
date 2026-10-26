import type { ReactNode } from 'react';

import type { SpeciesDescription } from '../../model/types';

export type SpeciesCardProps = {
  description: SpeciesDescription;
  /** Место в конце карточки (позже — «Подробнее в альманахе»). */
  footer?: ReactNode;
};
