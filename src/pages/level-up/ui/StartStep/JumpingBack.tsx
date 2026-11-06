import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { styles } from './JumpingBack.styles';
import type { JumpingBackProps } from './JumpingBack.types';

const HEIGHT = 12;
const STEP = 120;

/** Рубашка, которая подпрыгивает на 12 px по очереди с соседями (раздел 8, шаг 4). */
export function JumpingBack({ jumpKey, index, animate, children }: JumpingBackProps) {
  const y = useSharedValue(0);
  useEffect(() => {
    if (!animate || jumpKey === 0) {
      return;
    }
    y.value = withDelay(
      200 + index * STEP,
      withSequence(withTiming(-HEIGHT, { duration: 140 }), withTiming(0, { duration: 180 })),
    );
  }, [jumpKey, index, animate, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[styles.fill, style]}>{children}</Animated.View>;
}
