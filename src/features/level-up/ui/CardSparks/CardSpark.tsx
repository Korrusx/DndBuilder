import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { DONE_TIMELINE } from '../../lib/doneMotion';
import type { CardSparkProps } from './CardSpark.types';
import { styles } from './CardSparks.styles';

const PEAK = 0.25;

/** Одна искра: проявляется к 25 % жизни, поднимается на 14, затем гаснет, поднимаясь до 60 (раздел 5). */
export function CardSpark({ delay, color, size, diamond, position }: CardSparkProps) {
  const life = useSharedValue(0);
  useEffect(() => {
    life.value = withDelay(
      delay,
      withSequence(
        withTiming(PEAK, { duration: DONE_TIMELINE.sparkLife * PEAK }),
        withTiming(1, { duration: DONE_TIMELINE.sparkLife * (1 - PEAK) }),
      ),
    );
    return () => cancelAnimation(life);
  }, [delay, life]);
  const style = useAnimatedStyle(() => {
    const value = life.value;
    const rising = value <= PEAK;
    const k = rising ? value / PEAK : (value - PEAK) / (1 - PEAK);
    return {
      opacity: value === 0 ? 0 : rising ? k : 1 - k,
      transform: [
        { translateY: rising ? -14 * k : -14 - 46 * k },
        { scale: rising ? 0.4 + 0.6 * k : 1 - 0.4 * k },
        { rotate: diamond ? '45deg' : '0deg' },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.spark, position, { width: size, height: size, backgroundColor: color }, style]}
    />
  );
}
