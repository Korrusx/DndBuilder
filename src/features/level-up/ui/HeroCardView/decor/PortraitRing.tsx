import { Canvas, Circle, RadialGradient, SweepGradient } from '@shopify/react-native-skia';

import { farthestCorner } from './geometry';
import type { PortraitRingProps } from './PortraitRing.types';

/** Кольцо портрета с конической заливкой от угла 210° и круглое «лицо» с радиальным градиентом (40 %, 35 %). */
export function PortraitRing({ theme, size, ring }: PortraitRingProps) {
  const center = { x: size / 2, y: size / 2 };
  const inner = size - ring * 2;
  // CSS conic-gradient считает угол от верха по часовой стрелке, Skia — от оси X.
  const rotation = ((theme.ring.startAngle - 90) * Math.PI) / 180;
  const face = { x: ring + inner * 0.4, y: ring + inner * 0.35 };
  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <Circle c={center} r={size / 2}>
        <SweepGradient c={center} colors={theme.ring.colors} origin={center} transform={[{ rotate: rotation }]} />
      </Circle>
      <Circle c={center} r={inner / 2}>
        <RadialGradient
          c={face}
          r={farthestCorner(inner * 0.4, inner * 0.35, inner, inner)}
          colors={theme.face.map(([, color]) => color)}
          positions={theme.face.map(([offset]) => offset)}
        />
      </Circle>
    </Canvas>
  );
}
