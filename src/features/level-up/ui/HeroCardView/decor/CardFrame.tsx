import { Canvas, LinearGradient, RoundedRect } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { FRAME } from '../HeroCardView.styles';
import type { CardFrameProps } from './CardFrame.types';
import { linearPoints } from './geometry';

/** Рамка-фольга: скругление 24, линейный градиент под углом 150° (у Пергамента — сплошной цвет). */
export function CardFrame({ theme, width, height, angle }: CardFrameProps) {
  const base = theme.frame.angle;
  const start = useDerivedValue(() => linearPoints(angle?.value ?? base, width, height).start);
  const end = useDerivedValue(() => linearPoints(angle?.value ?? base, width, height).end);
  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <RoundedRect x={0} y={0} width={width} height={height} r={FRAME.radius}>
        <LinearGradient
          start={start}
          end={end}
          colors={theme.frame.stops.map(([, color]) => color)}
          positions={theme.frame.stops.map(([offset]) => offset)}
        />
      </RoundedRect>
    </Canvas>
  );
}
