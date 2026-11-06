import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { t } from '@/shared/i18n';

import { BADGE, RITUAL_RING, TRANSITION } from '../../config/constants';
import { INTRO_COLORS } from '../../config/cardTheme';
import { DECK_UI } from '../../config/deckColors';
import { styles } from './FlyingRing.styles';
import type { FlyingRingProps } from './FlyingRing.types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const FLIGHT_EASING = Easing.bezier(0.4, 0, 0.2, 1);
const VIEW = RITUAL_RING.size;
const C = VIEW / 2;
/** Линия 3 у значка 44 — в единицах кольца 212. */
const END_STROKE = (BADGE.stroke * VIEW) / BADGE.size;

/**
 * Кольцо ритуала летит в шапку колоды (раздел 3 ТЗ): центр — к центру значка, область 212 → 44,
 * линия 7 → 3, цифра 100 → 18, свечение 320 → 0; под кольцом проявляется заливка значка.
 * В конце слой совпадает со значком один в один.
 */
export function FlyingRing({ from, to, level, capstone, onDone }: FlyingRingProps) {
  const palette = capstone ? INTRO_COLORS.capstone : INTRO_COLORS.normal;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withTiming(1, { duration: TRANSITION.flight, easing: FLIGHT_EASING }, (finished) => {
        if (finished) {
          scheduleOnRN(onDone);
        }
      }),
    );
    // Полёт — один раз.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const layer = useAnimatedStyle(() => {
    const p = progress.get();
    const size = interpolate(p, [0, 1], [RITUAL_RING.size, BADGE.size]);
    const x = interpolate(p, [0, 1], [from.x, to.x]);
    const y = interpolate(p, [0, 1], [from.y, to.y]);
    return { left: x - size / 2, top: y - size / 2, width: size, height: size };
  });
  const glow = useAnimatedStyle(() => {
    const p = progress.get();
    const size = interpolate(p, [0, 1], [RITUAL_RING.glow, 0]);
    return { width: size, height: size, opacity: 1 - p };
  });
  const digit = useAnimatedStyle(() => {
    const size = interpolate(progress.get(), [0, 1], [RITUAL_RING.digit, BADGE.digit]);
    return { fontSize: size, lineHeight: size + 2 };
  });
  const caption = useAnimatedStyle(() => {
    const p = progress.get();
    const scale = interpolate(p, [0, 1], [1, BADGE.size / RITUAL_RING.size]);
    // «УРОВЕНЬ» гаснет за первые 200 мс.
    return {
      opacity: Math.max(0, 1 - (p * TRANSITION.flight) / TRANSITION.fadeOut),
      top: interpolate(p, [0, 1], [46, 46 * scale]),
      fontSize: 12 * scale,
      letterSpacing: 1.68 * scale,
    };
  });
  const ring = useAnimatedProps(() => ({
    strokeWidth: interpolate(progress.get(), [0, 1], [RITUAL_RING.stroke, END_STROKE]),
    fillOpacity: progress.get(),
  }));

  return (
    <Animated.View style={[styles.layer, layer]} pointerEvents="none">
      <Animated.View style={[styles.glow, glow]}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${RITUAL_RING.glow} ${RITUAL_RING.glow}`}>
          <Defs>
            <RadialGradient id="flyGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={`rgba(${palette.glow},0.42)`} />
              <Stop offset="0.45" stopColor={`rgba(${palette.glow},0.12)`} />
              <Stop offset="0.7" stopColor={`rgba(${palette.glow},0)`} />
            </RadialGradient>
          </Defs>
          <Circle cx={RITUAL_RING.glow / 2} cy={RITUAL_RING.glow / 2} r={RITUAL_RING.glow / 2} fill="url(#flyGlow)" />
        </Svg>
      </Animated.View>
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW} ${VIEW}`}>
          <AnimatedCircle
            cx={C}
            cy={C}
            r={RITUAL_RING.radius}
            fill={DECK_UI.badgeFill}
            stroke={palette.ring}
            animatedProps={ring}
          />
        </Svg>
      </View>
      <Animated.Text style={[styles.caption, caption]}>{t('levelUpDeck.level').toLocaleUpperCase()}</Animated.Text>
      <Animated.Text style={[styles.digit, { color: palette.ring }, digit]}>{level}</Animated.Text>
    </Animated.View>
  );
}
