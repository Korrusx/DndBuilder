import type { StyleProp, ViewStyle } from 'react-native';

import type { LevelUpCardType } from '../../model/types';

export type CardBackProps = {
  type: LevelUpCardType | 'summary';
  label: string;
  /** Точка в углу: нужен выбор. */
  dot?: boolean;
  /** Маленькая карта ленты колоды (без иконки). */
  small?: boolean;
  /** Текущая карта ленты — приподнята и с яркой рамкой. */
  current?: boolean;
  /** Подпись над названием («не перевёрнута»). */
  note?: string;
  /** Подпись под названием («7-й уровень»). */
  sub?: string;
  /** Лицом вверх: без полос, фон типа. */
  open?: boolean;
  style?: StyleProp<ViewStyle>;
};
