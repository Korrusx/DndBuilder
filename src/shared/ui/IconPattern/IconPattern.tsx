import { memo, useId } from 'react';
import Svg, { Defs, G, LinearGradient, Mask, Path, Pattern, Rect, Stop } from 'react-native-svg';

import { GAME_ICONS, iconPattern } from '@/shared/config';

import { styles } from './IconPattern.styles';
import type { IconPatternProps } from './IconPattern.types';

const { width, tile, icon: iconSize, opacity } = iconPattern;
const scale = iconSize / 512;
const half = tile / 2;

/**
 * Повторяющийся узор из иконки у правого края карточки, к середине растворяется (как фон ответа в Telegram).
 * Карточке нужен `overflow: 'hidden'`.
 */
export const IconPattern = memo(function IconPattern({ icon, color }: IconPatternProps) {
  // id элементов SVG: из useId убираем двоеточия, иначе url(#…) не сработает.
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg style={styles.pattern} width={width} height="100%" pointerEvents="none">
      <Defs>
        <Pattern id={`p${id}`} patternUnits="userSpaceOnUse" width={tile} height={tile}>
          <G transform={`translate(4 4) scale(${scale})`}>
            <Path d={GAME_ICONS[icon]} fill={color} />
          </G>
          <G transform={`translate(${half + 4} ${half + 4}) scale(${scale})`}>
            <Path d={GAME_ICONS[icon]} fill={color} />
          </G>
        </Pattern>
        <LinearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#fff" stopOpacity={0} />
          <Stop offset="1" stopColor="#fff" stopOpacity={opacity} />
        </LinearGradient>
        <Mask id={`m${id}`}>
          <Rect width="100%" height="100%" fill={`url(#g${id})`} />
        </Mask>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#p${id})`} mask={`url(#m${id})`} />
    </Svg>
  );
});
