import { Canvas, Group, LinearGradient, Path, Rect } from '@shopify/react-native-skia';

import { DIVIDER_ICON } from '../HeroCardView.styles';
import type { D20DividerProps } from './D20Divider.types';

const GAP = 10;
const HEX = 'M12 2l8.7 5v10L12 22l-8.7-5V7z';
const HEX_LINES = 'M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17';

/** Разделитель: линия из прозрачного · шестиугольник к20 · линия в прозрачное. */
export function D20Divider({ theme, width }: D20DividerProps) {
  const mid = DIVIDER_ICON / 2;
  const line = (width - DIVIDER_ICON) / 2 - GAP;
  const iconX = line + GAP;
  const right = iconX + DIVIDER_ICON + GAP;
  return (
    <Canvas style={{ width, height: DIVIDER_ICON }} pointerEvents="none">
      <Rect x={0} y={mid - 0.5} width={line} height={1}>
        <LinearGradient start={{ x: 0, y: 0 }} end={{ x: line, y: 0 }} colors={['transparent', theme.divider]} />
      </Rect>
      <Group transform={[{ translateX: iconX }, { scale: DIVIDER_ICON / 24 }]}>
        <Path path={HEX} style="stroke" strokeWidth={1.6} color={theme.corner} />
        <Path path={HEX_LINES} style="stroke" strokeWidth={1} color={theme.divider} />
      </Group>
      <Rect x={right} y={mid - 0.5} width={line} height={1}>
        <LinearGradient
          start={{ x: right, y: 0 }}
          end={{ x: right + line, y: 0 }}
          colors={[theme.divider, 'transparent']}
        />
      </Rect>
    </Canvas>
  );
}
