import { useRef } from 'react';
import type { ViewInstance } from 'react-native';
import { useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { DEAL_SPRING, DEAL_TILT, TRANSITION } from '@/features/level-up';

import type { DealInProps } from './DealIn.types';

/**
 * Раздача карты из кольца (раздел 3 ТЗ): карта стартует из центра кольца прозрачной, уменьшенной до 0,6
 * и наклонённой на ±6°, и пружиной летит на своё место. Карты ниже края экрана появляются без анимации.
 */
export function DealIn({ index, origin, children }: DealInProps) {
  const ref = useRef<ViewInstance>(null);
  const { height } = useWindowDimensions();
  const started = useRef(false);
  const opacity = useSharedValue(origin ? 0 : 1);
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const scale = useSharedValue(1);
  const tilt = useSharedValue(0);

  const onLayout = () => {
    if (!origin || started.current) {
      return;
    }
    started.current = true;
    ref.current?.measureInWindow((x, y, width, h) => {
      if (y > height) {
        opacity.set(1);
        return;
      }
      const delay = TRANSITION.dealStart + index * TRANSITION.dealStep;
      dx.set(origin.x - (x + width / 2));
      dy.set(origin.y - (y + h / 2));
      scale.set(0.6);
      tilt.set(index % 2 === 0 ? -DEAL_TILT : DEAL_TILT);
      opacity.set(withDelay(delay, withTiming(1, { duration: TRANSITION.dealDuration / 2 })));
      dx.set(withDelay(delay, withSpring(0, DEAL_SPRING)));
      dy.set(withDelay(delay, withSpring(0, DEAL_SPRING)));
      scale.set(withDelay(delay, withSpring(1, DEAL_SPRING)));
      tilt.set(withDelay(delay, withSpring(0, DEAL_SPRING)));
    });
  };

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      { translateX: dx.get() },
      { translateY: dy.get() },
      { scale: scale.get() },
      { rotate: `${tilt.get()}deg` },
    ],
  }));

  return (
    <Animated.View ref={ref} onLayout={onLayout} style={style} collapsable={false}>
      {children}
    </Animated.View>
  );
}
