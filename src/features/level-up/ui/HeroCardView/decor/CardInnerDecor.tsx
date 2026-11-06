import {
  Canvas,
  Group,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  RoundedRect,
  rrect,
  rect,
} from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';

import { FRAME } from '../HeroCardView.styles';
import type { CardInnerDecorProps } from './CardInnerDecor.types';
import { farthestCorner, rgba } from './geometry';

const RULE_INSET = 8;
const RULE_RADIUS = 16;
const CORNER = 14;
const CORNER_INSET = 2;
const SHEEN = { width: 0.34, height: 1.8, top: -0.4, from: -1.6, to: 2.6, angle: (20 * Math.PI) / 180 };

/**
 * Внутренняя часть карты: радиальный фон с центром (50 %, 0 %), тонкая рамка с отступом 8, ромбы по углам
 * и блик — косая светлая полоса, которая пробегает по карте.
 */
export function CardInnerDecor({ layer, theme, width, height, sheenProgress, sheenOpacity }: CardInnerDecorProps) {
  const clip = rrect(rect(0, 0, width, height), FRAME.innerRadius, FRAME.innerRadius);
  const band = { w: width * SHEEN.width, h: height * SHEEN.height, y: height * SHEEN.top };
  const origin = { x: band.w / 2, y: band.y + band.h / 2 };
  const transform = useDerivedValue(() => [
    { translateX: band.w * (SHEEN.from + (SHEEN.to - SHEEN.from) * (sheenProgress?.value ?? 0)) },
    { rotate: SHEEN.angle },
  ]);
  const opacity = useDerivedValue(() => sheenOpacity?.value ?? 0);
  const corners = [
    [CORNER_INSET, CORNER_INSET],
    [width - CORNER_INSET - CORNER, CORNER_INSET],
    [CORNER_INSET, height - CORNER_INSET - CORNER],
    [width - CORNER_INSET - CORNER, height - CORNER_INSET - CORNER],
  ];
  const half = CORNER / 2;
  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Group clip={clip}>
        {layer === 'back' ? (
          <>
            <Rect x={0} y={0} width={width} height={height}>
              <RadialGradient
                c={{ x: width / 2, y: 0 }}
                r={farthestCorner(width / 2, 0, width, height)}
                colors={theme.innerBg.map(([, color]) => color)}
                positions={theme.innerBg.map(([offset]) => offset)}
              />
            </Rect>
            <RoundedRect
              x={RULE_INSET + 0.5}
              y={RULE_INSET + 0.5}
              width={width - RULE_INSET * 2 - 1}
              height={height - RULE_INSET * 2 - 1}
              r={RULE_RADIUS}
              style="stroke"
              strokeWidth={1}
              color={theme.rule}
            />
            {corners.map(([x, y]) => (
              <Path
                key={`${x}-${y}`}
                path={`M${x + half} ${y}L${x + CORNER} ${y + half}L${x + half} ${y + CORNER}L${x} ${y + half}Z`}
                color={theme.corner}
              />
            ))}
          </>
        ) : null}
        {layer === 'sheen' && sheenProgress ? (
          <Group opacity={opacity} origin={origin} transform={transform}>
            <Rect x={0} y={band.y} width={band.w} height={band.h}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: band.w, y: 0 }}
                colors={[
                  rgba(theme.sheen, 0),
                  rgba(theme.sheen, 0.18),
                  theme.sheenCore,
                  rgba(theme.sheen, 0.18),
                  rgba(theme.sheen, 0),
                ]}
                positions={[0, 0.45, 0.5, 0.55, 1]}
              />
            </Rect>
          </Group>
        ) : null}
      </Group>
    </Canvas>
  );
}
