import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { GLOW, introTimeline } from '@/features/level-up';

import { styles } from './HintFade.styles';
import type { HintFadeProps } from './HintFade.types';

/** Заголовок и подзаголовок У1: приглушены (0,35) до 1700 мс, к 2200 мс проявляются полностью. */
export function HintFade({ playKey, animate, capstone, children }: HintFadeProps) {
  const opacity = useSharedValue(animate ? GLOW.hintDim : 1);
  useEffect(() => {
    cancelAnimation(opacity);
    if (!animate) {
      opacity.value = 1;
      return;
    }
    const time = introTimeline(capstone);
    opacity.value = GLOW.hintDim;
    opacity.value = withDelay(time.hintStart, withTiming(1, { duration: time.settle - time.hintStart }));
    return () => cancelAnimation(opacity);
  }, [playKey, animate, capstone, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.who, style]}>{children}</Animated.View>;
}
