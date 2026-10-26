import type { ReactNode } from 'react';

import type { GameIconName } from '@/shared/ui';

export type DescriptionCardProps = {
  icon?: GameIconName;
  title: string;
  /** Строка под названием: роль класса, суть вида или предыстории. */
  subtitle?: string;
  /** Справа в шапке (сложность класса). */
  aside?: ReactNode;
  /** Метка источника («Не из SRD»). */
  badge?: string;
  children: ReactNode;
  /** Место в конце карточки (позже — «Подробнее в альманахе»). */
  footer?: ReactNode;
};

export type DescriptionBlockProps = {
  title: string;
  children: ReactNode;
};
