import { Canvas, Group, RadialGradient, Rect } from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

import type { CardStyle } from '../../config/heroCardThemes';
import { CARD_STYLES, HERO_CARD_THEMES } from '../../config/heroCardThemes';
import { DONE_TIMELINE } from '../../lib/doneMotion';
import { farthestCorner } from '../HeroCardView/decor/geometry';
import { styles } from './StyleBackdrop.styles';
import type { StyleBackdropProps } from './StyleBackdrop.types';

/** Фон экрана итога и картинок «Поделиться»: радиальный градиент `screenBg` стиля, переход между стилями за 300 мс. */
export function StyleBackdrop({ style, animate, centerY = 0.38, positions = [0, 0.48, 0.8] }: StyleBackdropProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const amber = useSharedValue(style === 'amber' ? 1 : 0);
  const night = useSharedValue(style === 'night' ? 1 : 0);
  const parchment = useSharedValue(style === 'parchment' ? 1 : 0);
  useEffect(() => {
    const to = (id: CardStyle) => {
      const target = id === style ? 1 : 0;
      return animate ? withTiming(target, { duration: DONE_TIMELINE.backgroundFade }) : target;
    };
    amber.set(to('amber'));
    night.set(to('night'));
    parchment.set(to('parchment'));
  }, [style, animate, amber, night, parchment]);

  const opacity = {
    amber: useDerivedValue(() => amber.get()),
    night: useDerivedValue(() => night.get()),
    parchment: useDerivedValue(() => parchment.get()),
  };
  const { width, height } = size;
  const c = { x: width / 2, y: height * centerY };
  const r = farthestCorner(c.x, c.y, width, height);

  return (
    <View
      style={styles.fill}
      pointerEvents="none"
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {width ? (
        <Canvas style={styles.fill}>
          {CARD_STYLES.map((id: CardStyle) => {
            const stops = HERO_CARD_THEMES[id].screenBg.map(([, color]) => color);
            return (
              <Group key={id} opacity={opacity[id]}>
                <Rect x={0} y={0} width={width} height={height}>
                  <RadialGradient
                    c={c}
                    r={r}
                    colors={[...stops, stops[stops.length - 1]]}
                    positions={[...positions, 1]}
                  />
                </Rect>
              </Group>
            );
          })}
        </Canvas>
      ) : null}
    </View>
  );
}
