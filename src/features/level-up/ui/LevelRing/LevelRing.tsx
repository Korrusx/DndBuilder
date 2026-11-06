import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { t } from '@/shared/i18n';

import { RING_COLORS } from '../../config/cardTheme';
import { ringInitial, ringTimings } from '../../lib/motion';
import { RING_RADIUS, RING_SIZE, RING_STROKE, styles } from './LevelRing.styles';
import type { LevelRingProps } from './LevelRing.types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * Кольцо уровня (раздел 8): серая старая цифра, кольцо заполняется по часовой стрелке, старая цифра гаснет,
 * новая влетает с пружиной, вспышка расходится. Без анимации — сразу новая цифра и полное кольцо.
 */
export function LevelRing({ from, to, animate, capstone, playKey, onPress, onSwap }: LevelRingProps) {
  const start = ringInitial(animate);
  const progress = useSharedValue(start.progress);
  const oldOpacity = useSharedValue(start.oldOpacity);
  const oldScale = useSharedValue(start.oldScale);
  const newOpacity = useSharedValue(start.newOpacity);
  const newScale = useSharedValue(start.newScale);
  const burstOpacity = useSharedValue(start.burstOpacity);
  const burstScale = useSharedValue(start.burstScale);
  const glow = useSharedValue(animate ? 0 : 0.12);
  const color = capstone ? RING_COLORS.capstone : RING_COLORS.normal;

  useEffect(() => {
    if (!animate) {
      const end = ringInitial(false);
      progress.value = end.progress;
      oldOpacity.value = end.oldOpacity;
      newOpacity.value = end.newOpacity;
      newScale.value = end.newScale;
      return;
    }
    const time = ringTimings(!!capstone);
    const begin = ringInitial(true);
    progress.value = begin.progress;
    oldOpacity.value = begin.oldOpacity;
    oldScale.value = begin.oldScale;
    newOpacity.value = begin.newOpacity;
    newScale.value = begin.newScale;
    burstOpacity.value = 0;
    burstScale.value = begin.burstScale;
    glow.value = 0;
    const ease = Easing.bezier(0.45, 0, 0.2, 1);
    progress.value = withDelay(time.delay, withTiming(1, { duration: time.fill, easing: ease }));
    oldOpacity.value = withDelay(time.swapAt, withTiming(0, { duration: 200 }));
    oldScale.value = withDelay(time.swapAt, withTiming(0.55, { duration: 200 }));
    newOpacity.value = withDelay(time.swapAt + 50, withTiming(1, { duration: 150 }));
    newScale.value = withDelay(
      time.swapAt + 50,
      withSequence(withTiming(0.92, { duration: time.digitIn * 0.6 }), withSpring(1, { damping: 8 })),
    );
    burstOpacity.value = withDelay(
      time.swapAt,
      withSequence(withTiming(0.9, { duration: 80 }), withTiming(0, { duration: time.burst })),
    );
    burstScale.value = withDelay(time.swapAt, withTiming(1.55, { duration: time.burst + 80 }));
    glow.value = withDelay(
      time.swapAt,
      withSequence(withTiming(0.35, { duration: 150 }), withTiming(0.12, { duration: 900 })),
    );
    const timer = setTimeout(() => onSwap?.(), time.swapAt);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, capstone, playKey]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - progress.value) }));
  const oldStyle = useAnimatedStyle(() => ({ opacity: oldOpacity.value, transform: [{ scale: oldScale.value }] }));
  const newStyle = useAnimatedStyle(() => ({ opacity: newOpacity.value, transform: [{ scale: newScale.value }] }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const center = RING_SIZE / 2;

  return (
    <Pressable
      accessibilityRole="image"
      accessibilityLabel={t('levelUpDeck.levelChange', { from, to })}
      accessibilityHint={onPress ? t('levelUpDeck.replay') : undefined}
      onPress={onPress}
      style={styles.ring}
    >
      <Animated.View style={[styles.glow, { backgroundColor: color }, glowStyle]} />
      <Animated.View style={[styles.burst, { borderColor: color }, burstStyle]} />
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.layer}>
        <Circle
          cx={center}
          cy={center}
          r={RING_RADIUS}
          fill="#13151A"
          stroke={RING_COLORS.track}
          strokeWidth={RING_STROKE}
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={LENGTH}
          animatedProps={ringProps}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <Animated.Text style={[styles.caption]}>{t('levelUpDeck.level').toLocaleUpperCase()}</Animated.Text>
      <Animated.Text style={[styles.digit, { color: RING_COLORS.old }, oldStyle]}>{from}</Animated.Text>
      <Animated.Text style={[styles.digit, { color }, newStyle]}>{to}</Animated.Text>
    </Pressable>
  );
}
