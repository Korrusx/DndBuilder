import { Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { t } from '@/shared/i18n';

import { BADGE } from '../../config/constants';
import { INTRO_COLORS } from '../../config/cardTheme';
import { DECK_UI } from '../../config/deckColors';
import { styles } from './LevelBadge.styles';
import type { LevelBadgeProps } from './LevelBadge.types';

const GLOW = BADGE.size + BADGE.glow * 2;
const C = BADGE.size / 2;

/**
 * Значок уровня в шапке колоды: круг радиусом 19 с заливкой и обводкой 3, цифра 18, мягкое свечение
 * (радиальным градиентом, не тенью — на Android цветная тень не работает).
 */
export function LevelBadge({ level, capstone, hidden, badgeRef, onLayout }: LevelBadgeProps) {
  const palette = capstone ? INTRO_COLORS.capstone : INTRO_COLORS.normal;
  return (
    <View
      ref={badgeRef}
      onLayout={onLayout}
      collapsable={false}
      style={[styles.badge, hidden && { opacity: 0 }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('levelUpDeck.screen.badge', { level })}
    >
      <Svg width={GLOW} height={GLOW} style={styles.glow} pointerEvents="none">
        <Defs>
          <RadialGradient id="badgeGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0.4" stopColor={`rgba(${palette.glow},0.35)`} />
            <Stop offset="1" stopColor={`rgba(${palette.glow},0)`} />
          </RadialGradient>
        </Defs>
        <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#badgeGlow)" />
      </Svg>
      <Svg width={BADGE.size} height={BADGE.size} style={styles.svg}>
        <Circle
          cx={C}
          cy={C}
          r={BADGE.radius}
          fill={DECK_UI.badgeFill}
          stroke={palette.ring}
          strokeWidth={BADGE.stroke}
        />
      </Svg>
      <Text style={[styles.digit, { color: palette.ring }]}>{level}</Text>
    </View>
  );
}
