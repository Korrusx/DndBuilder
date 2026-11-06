import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { INTRO_COLORS } from '../../config/cardTheme';
import { styles } from './IntroBackground.styles';
import type { RadialFillProps } from './RadialFill.types';

/** Радиальный градиент на весь экран, как CSS «circle at 50% 36%: центр → mid 52 % → край 85 %». */
export function RadialFill({ id, center, width, height, centerY }: RadialFillProps) {
  const cy = height * centerY;
  // Радиус круга CSS по умолчанию — до самого дальнего угла.
  const r = Math.sqrt((width / 2) ** 2 + Math.max(cy, height - cy) ** 2);
  return (
    <Svg width={width} height={height} style={styles.fill}>
      <Defs>
        <RadialGradient id={id} cx={width / 2} cy={cy} r={r} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={center} />
          <Stop offset="0.52" stopColor={INTRO_COLORS.background.mid} />
          <Stop offset="0.85" stopColor={INTRO_COLORS.background.edge} />
          <Stop offset="1" stopColor={INTRO_COLORS.background.edge} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill={`url(#${id})`} />
    </Svg>
  );
}
