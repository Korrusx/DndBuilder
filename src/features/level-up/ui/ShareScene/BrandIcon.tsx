import { Canvas, Group, Path } from '@shopify/react-native-skia';

import type { BrandIconProps } from './BrandIcon.types';

const HEX = 'M12 2l8.7 5v10L12 22l-8.7-5V7z';
const HEX_LINES = 'M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17';

/** Иконка к20 у знака бренда в сторис: шестиугольник цвета `corner` с гранями цвета фона. */
export function BrandIcon({ theme, size }: BrandIconProps) {
  const edge = theme.screenBg[theme.screenBg.length - 1][1];
  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <Group transform={[{ scale: size / 24 }]}>
        <Path path={HEX} color={theme.corner} />
        <Path path={HEX_LINES} style="stroke" strokeWidth={1.2} color={edge} />
      </Group>
    </Canvas>
  );
}
