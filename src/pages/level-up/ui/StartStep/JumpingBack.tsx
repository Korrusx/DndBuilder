import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { introTimeline, jumpRotation } from '@/features/level-up';

import { styles } from './JumpingBack.styles';
import type { JumpingBackProps } from './JumpingBack.types';

const HEIGHT = 12;

/** Рубашка, которая подпрыгивает на 12 px в 1650 + i × 120 мс за 300 мс, с лёгким поворотом (раздел 8). */
export function JumpingBack({ playKey, index, count, animate, capstone, children }: JumpingBackProps) {
  const lift = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(lift);
    lift.value = 0;
    if (!animate) {
      return;
    }
    const time = introTimeline(capstone);
    const half = time.jumpDuration / 2;
    lift.value = withDelay(
      time.jumpStart + index * time.jumpStep,
      withSequence(withTiming(1, { duration: half }), withTiming(0, { duration: half })),
    );
    return () => cancelAnimation(lift);
  }, [playKey, index, animate, capstone, lift]);
  const rotation = jumpRotation(index, count);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -HEIGHT * lift.value }, { rotate: `${rotation * lift.value}deg` }],
  }));
  return <Animated.View style={[styles.fill, style]}>{children}</Animated.View>;
}
