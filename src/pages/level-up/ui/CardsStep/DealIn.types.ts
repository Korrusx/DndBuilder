import type { ReactNode } from 'react';

import type { ScreenPoint } from '@/features/level-up';

export type DealInProps = {
  /** Номер карты в колоде: задержка 200 + i × 70, чётные наклонены влево, нечётные вправо. */
  index: number;
  /** Центр кольца ритуала: отсюда карта прилетает. Нет — карта сразу на месте. */
  origin: ScreenPoint | null;
  children: ReactNode;
};
