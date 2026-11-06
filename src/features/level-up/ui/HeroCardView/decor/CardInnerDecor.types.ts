import type { SharedValue } from 'react-native-reanimated';

import type { HeroCardTheme } from '../../../config/heroCardThemes';

export type CardInnerDecorProps = {
  /** «back» — фон, рамка и ромбы под содержимым; «sheen» — блик поверх содержимого. */
  layer: 'back' | 'sheen';
  theme: HeroCardTheme;
  width: number;
  height: number;
  /** Положение блика 0…1 (−160 % … +260 % ширины полосы); нет — блика нет. */
  sheenProgress?: SharedValue<number>;
  sheenOpacity?: SharedValue<number>;
};
