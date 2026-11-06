import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { MOTION } from '../../config/deck';
import { flipInitial } from '../../lib/motion';
import { styles } from './FlipCard.styles';
import type { FlipCardProps } from './FlipCard.types';

/** Карта, которая переворачивается по оси Y (350 мс, лёгкая вибрация). Без анимации — сразу нужной стороной. */
export function FlipCard({ revealed, animate, back, front, onPress, style, accessibilityLabel }: FlipCardProps) {
  const rotation = useSharedValue(flipInitial(revealed));

  useEffect(() => {
    const target = flipInitial(revealed);
    if (rotation.value === target) {
      return;
    }
    if (animate) {
      rotation.value = withTiming(target, { duration: MOTION.flip });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    } else {
      rotation.value = target;
    }
  }, [revealed, animate, rotation]);

  // Лицо видно со второй половины поворота; opacity страхует Android, где backfaceVisibility капризничает.
  const backStyle = useAnimatedStyle(() => ({
    opacity: rotation.value < 90 ? 1 : 0,
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
  }));
  const frontStyle = useAnimatedStyle(() => ({
    opacity: rotation.value >= 90 ? 1 : 0,
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.wrap, style]}
    >
      <Animated.View style={[styles.face, frontStyle]} pointerEvents={revealed ? 'auto' : 'none'}>
        {front}
      </Animated.View>
      <Animated.View style={[styles.back, backStyle]} pointerEvents={revealed ? 'none' : 'auto'}>
        {back}
      </Animated.View>
    </Pressable>
  );
}
