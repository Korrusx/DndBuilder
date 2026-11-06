import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { INTRO_COLORS } from '../../config/cardTheme';
import { introTimeline } from '../../lib/motion';
import { styles } from './IntroBackground.styles';
import { RadialFill } from './RadialFill';
import type { IntroBackgroundProps } from './IntroBackground.types';

/**
 * Фон экрана У1 (раздел 8). В момент удара центр на миг теплеет (#241E13 → #3A2E18 к 1600 мс → обратно к 2200):
 * поверх основного градиента проявляется и гаснет такой же, но с тёплым центром.
 */
export function IntroBackground({ animate, playKey, capstone, centerY = 0.28 }: IntroBackgroundProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const warm = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(warm);
    warm.value = 0;
    if (!animate) {
      return;
    }
    const time = introTimeline(!!capstone);
    const peak = time.burstPeak;
    warm.value = withDelay(
      time.impact,
      withSequence(withTiming(1, { duration: peak }), withTiming(0, { duration: time.settle - time.impact - peak })),
    );
    return () => cancelAnimation(warm);
  }, [animate, capstone, playKey, warm]);

  const warmStyle = useAnimatedStyle(() => ({ opacity: warm.value }));
  const onLayout = (e: LayoutChangeEvent) =>
    setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });

  return (
    <View style={styles.fill} onLayout={onLayout} pointerEvents="none">
      {size.width ? (
        <>
          <RadialFill id="introBase" center={INTRO_COLORS.background.center} centerY={centerY} {...size} />
          <Animated.View style={[styles.fill, warmStyle]}>
            <RadialFill id="introWarm" center={INTRO_COLORS.background.warm} centerY={centerY} {...size} />
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}
