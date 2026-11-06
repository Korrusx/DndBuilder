import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { t } from '@/shared/i18n';

import { INTRO_COLORS, RING_COLORS } from '../../config/cardTheme';
import {
  FILL_TICKS,
  GLOW,
  glowFlicker,
  haloPulse,
  introTimeline,
  RING_END,
  RING_START,
  sparkPoint,
} from '../../lib/motion';
import { GLOW_SIZE, RING_CENTER, RING_RADIUS, RING_SIZE, RING_STROKE, styles } from './LevelRing.styles';
import type { LevelRingProps } from './LevelRing.types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const LENGTH = 2 * Math.PI * RING_RADIUS;
const FILL_EASING = Easing.bezier(0.45, 0, 0.2, 1);
const tick = () => {
  Haptics.selectionAsync().catch(() => undefined);
};

/**
 * Кольцо уровня У1 (раздел 8): свечение «дышит», пока кольцо заполняется, по концу дуги бежит искра,
 * на ударе старая цифра гаснет, новая влетает с пружиной, расходится вспышка. Без анимации — сразу конец.
 */
export function LevelRing({
  from,
  to,
  animate,
  capstone,
  playKey,
  fromImpact,
  onPress,
  onFill,
  onCancel,
  onImpact,
}: LevelRingProps) {
  const palette = capstone ? INTRO_COLORS.capstone : INTRO_COLORS.normal;
  // У вершины мерцание тоже на 30 % медленнее — два пульса за заполнение.
  const period = introTimeline(!!capstone).flickerPeriod;
  const start = animate ? RING_START : RING_END;
  const progress = useSharedValue(start.progress);
  /** Мс с начала заполнения — фаза мерцания. */
  const clock = useSharedValue(0);
  /** 1, пока кольцо заполняется: свечение мерцает; 0 — свечение берёт glowOpacity/glowScale. */
  const filling = useSharedValue(0);
  /** Вибрации на 25/50/75 % включены только во время анимации. */
  const armed = useSharedValue(0);
  const glowOpacity = useSharedValue(start.glowOpacity);
  const glowScale = useSharedValue(start.glowScale);
  const sparkOpacity = useSharedValue(start.sparkOpacity);
  const oldOpacity = useSharedValue(start.oldOpacity);
  const oldScale = useSharedValue(start.oldScale);
  const newOpacity = useSharedValue(start.newOpacity);
  const newScale = useSharedValue(start.newScale);
  const burstOpacity = useSharedValue(start.burstOpacity);
  const burstScale = useSharedValue(start.burstScale);

  useEffect(() => {
    const values = [progress, clock, filling, armed, glowOpacity, glowScale, sparkOpacity];
    const digits = [oldOpacity, oldScale, newOpacity, newScale, burstOpacity, burstScale];
    const stop = () => [...values, ...digits].forEach((value) => cancelAnimation(value));
    stop();
    if (!animate) {
      progress.value = RING_END.progress;
      filling.value = 0;
      armed.value = 0;
      glowOpacity.value = RING_END.glowOpacity;
      glowScale.value = RING_END.glowScale;
      sparkOpacity.value = 0;
      oldOpacity.value = RING_END.oldOpacity;
      oldScale.value = RING_END.oldScale;
      newOpacity.value = RING_END.newOpacity;
      newScale.value = RING_END.newScale;
      burstOpacity.value = 0;
      return stop;
    }
    const time = introTimeline(!!capstone);
    const fill = time.fillEnd - time.fillStart;
    // Пропуск: таймлайн сразу с удара — кольцо полное, старая цифра ушла.
    const impactAt = fromImpact ? 0 : time.impact;
    // Покой 0–300 мс: серая старая цифра, пустое кольцо, слабое свечение.
    progress.value = fromImpact ? 1 : 0;
    clock.value = fromImpact ? fill : 0;
    filling.value = fromImpact ? 0 : 1;
    armed.value = fromImpact ? 0 : 1;
    glowOpacity.value = glowFlicker(1, fill, time.flickerPeriod);
    glowScale.value = GLOW.endScale;
    sparkOpacity.value = 0;
    oldOpacity.value = fromImpact ? 0 : 1;
    oldScale.value = fromImpact ? RING_END.oldScale : 1;
    newOpacity.value = 0;
    newScale.value = RING_START.newScale;
    burstOpacity.value = 0;
    burstScale.value = RING_START.burstScale;

    if (!fromImpact) {
      // 300–1500: заполнение, искра, мерцание.
      progress.value = withDelay(time.fillStart, withTiming(1, { duration: fill, easing: FILL_EASING }));
      clock.value = withDelay(time.fillStart, withTiming(fill, { duration: fill, easing: Easing.linear }));
      sparkOpacity.value = withSequence(
        withDelay(time.fillStart, withTiming(1, { duration: 60 })),
        withDelay(fill - 60, withTiming(0, { duration: time.sparkFade })),
      );
      filling.value = withDelay(time.fillEnd, withTiming(0, { duration: 0 }));
      armed.value = withDelay(time.fillEnd, withTiming(0, { duration: 0 }));
      // 1500–1650: старая цифра уходит.
      oldOpacity.value = withDelay(
        time.fillEnd,
        withTiming(0, { duration: time.oldOut, easing: Easing.in(Easing.quad) }),
      );
      oldScale.value = withDelay(
        time.fillEnd,
        withTiming(0.55, { duration: time.oldOut, easing: Easing.in(Easing.quad) }),
      );
    }
    // 1550: удар — новая цифра, вспышка, пик свечения.
    newOpacity.value = withDelay(impactAt, withTiming(1, { duration: time.newFade }));
    newScale.value = withDelay(
      impactAt,
      withSequence(withTiming(0.92, { duration: time.newDip }), withSpring(1, GLOW.spring)),
    );
    burstOpacity.value = withDelay(
      impactAt,
      withSequence(
        withTiming(0.9, { duration: time.burstPeak }),
        withTiming(0, { duration: time.burstEnd - time.burstPeak }),
      ),
    );
    burstScale.value = withDelay(impactAt, withTiming(1.55, { duration: time.burstEnd }));
    const settle = time.settle - time.impact - time.glowPeak;
    glowOpacity.value = withDelay(
      impactAt,
      withSequence(
        withTiming(GLOW.peakOpacity, { duration: time.glowPeak }),
        withTiming(GLOW.endOpacity, { duration: settle }),
      ),
    );
    glowScale.value = withDelay(
      impactAt,
      withSequence(
        withTiming(GLOW.peakScale, { duration: time.glowPeak }),
        withTiming(GLOW.endScale, { duration: settle }),
      ),
    );
    const fillTimer = fromImpact ? undefined : setTimeout(() => onFill?.(), time.fillStart);
    const impact = setTimeout(() => onImpact?.(), impactAt);
    // Звук обрывается, только если с экрана ушли посреди анимации («Открыть новинки» после неё — нет).
    let settled = false;
    const settleTimer = setTimeout(() => (settled = true), time.settle - (fromImpact ? time.impact : 0));
    // Уход с экрана: ни анимаций, ни вибраций.
    return () => {
      clearTimeout(fillTimer);
      clearTimeout(impact);
      clearTimeout(settleTimer);
      if (!settled) {
        onCancel?.();
      }
      stop();
      armed.value = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, capstone, playKey, fromImpact]);

  // Лёгкая вибрация на 25, 50 и 75 % заполнения.
  useAnimatedReaction(
    () => progress.value,
    (now, before) => {
      if (!armed.value || before === null) {
        return;
      }
      for (const mark of FILL_TICKS) {
        if (before < mark && now >= mark) {
          scheduleOnRN(tick);
        }
      }
    },
  );

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - progress.value) }));
  const sparkProps = useAnimatedProps(() => {
    const point = sparkPoint(progress.value, RING_CENTER, RING_RADIUS);
    return { cx: point.x, cy: point.y, opacity: sparkOpacity.value };
  });
  const haloProps = useAnimatedProps(() => {
    const point = sparkPoint(progress.value, RING_CENTER, RING_RADIUS);
    return { cx: point.x, cy: point.y, opacity: sparkOpacity.value * haloPulse(clock.value, period) };
  });
  const glowStyle = useAnimatedStyle(() => {
    const flickering = filling.value > 0;
    return {
      opacity: flickering ? glowFlicker(progress.value, clock.value, period) : glowOpacity.value,
      transform: [
        { scale: flickering ? GLOW.restScale + (GLOW.endScale - GLOW.restScale) * progress.value : glowScale.value },
      ],
    };
  });
  const oldStyle = useAnimatedStyle(() => ({ opacity: oldOpacity.value, transform: [{ scale: oldScale.value }] }));
  const newStyle = useAnimatedStyle(() => ({ opacity: newOpacity.value, transform: [{ scale: newScale.value }] }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }],
  }));
  const glow = (alpha: number) => `rgba(${palette.glow},${alpha})`;

  return (
    <Pressable
      accessibilityRole="image"
      accessibilityLabel={t('levelUpDeck.levelChange', { from, to })}
      accessibilityHint={onPress ? t('levelUpDeck.replay') : undefined}
      onPress={onPress}
      style={styles.ring}
    >
      <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none">
        <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
          <Defs>
            <RadialGradient id="levelGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={glow(0.42)} />
              <Stop offset="0.45" stopColor={glow(0.12)} />
              <Stop offset="0.7" stopColor={glow(0)} />
              <Stop offset="1" stopColor={glow(0)} />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#levelGlow)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.burst, { borderColor: palette.ring }, burstStyle]} pointerEvents="none" />
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svg}>
        <Defs>
          <RadialGradient id="levelHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={glow(0.6)} />
            <Stop offset="1" stopColor={glow(0)} />
          </RadialGradient>
        </Defs>
        <Circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={RING_COLORS.track}
          strokeWidth={RING_STROKE}
        />
        <AnimatedCircle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={palette.ring}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={LENGTH}
          animatedProps={ringProps}
          transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
        />
        <AnimatedCircle r={14} fill="url(#levelHalo)" animatedProps={haloProps} />
        <AnimatedCircle r={4} fill={palette.spark} animatedProps={sparkProps} />
      </Svg>
      <Animated.Text style={styles.caption}>{t('levelUpDeck.level').toLocaleUpperCase()}</Animated.Text>
      <Animated.Text style={[styles.digit, { color: RING_COLORS.old }, oldStyle]}>{from}</Animated.Text>
      <Animated.Text style={[styles.digit, { color: palette.ring }, newStyle]}>{to}</Animated.Text>
    </Pressable>
  );
}
