import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

import type { FadeSwapProps } from './FadeSwap.types';

const DURATION = 180;

/** Короткий fade содержимого при смене `swapKey` (выбран другой класс, вид, подраса). */
export function FadeSwap({ swapKey, children }: FadeSwapProps) {
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: DURATION, useNativeDriver: true }).start();
  }, [swapKey, opacity]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}
