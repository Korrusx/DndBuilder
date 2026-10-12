import Svg, { Path } from 'react-native-svg';

import { GAME_ICONS } from '@/shared/config';

import type { GameIconProps } from './GameIcon.types';

/** Иконка из набора game-icons.net (CC BY 3.0), одноцветная. */
export function GameIcon({ name, size, color }: GameIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path d={GAME_ICONS[name]} fill={color} />
    </Svg>
  );
}
