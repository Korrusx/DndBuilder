import { ReactNode } from 'react';

export type ScreenProps = {
  children: ReactNode;
  /** Нижняя панель, прибитая к низу экрана (например, кнопка «Далее»). */
  footer?: ReactNode;
  /** Фон под содержимым на весь экран (радиальный градиент повышения уровня). */
  background?: ReactNode;
};
