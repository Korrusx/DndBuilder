import type { ReactNode } from 'react';

import type { BackgroundDescription } from '../../model/types';

export type BackgroundCardProps = {
  description: BackgroundDescription;
  /** Название выбранного класса в дательном падеже («плуту») — для метки «Подходит плуту». */
  classDative?: string;
  /** Место в конце карточки (позже — «Подробнее в альманахе»). */
  footer?: ReactNode;
};
