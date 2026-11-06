import type { SharedValue } from 'react-native-reanimated';

import type { HeroCardTheme } from '../../../config/heroCardThemes';

export type CardFrameProps = {
  theme: HeroCardTheme;
  width: number;
  height: number;
  /** Угол фольги при наклоне; нет — угол темы. */
  angle?: SharedValue<number>;
};
