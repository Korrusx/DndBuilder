import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { TRANSITION } from '../../config/constants';
import { DECK_UI } from '../../config/deckColors';
import { styles } from './DeckFooter.styles';
import type { DeckFooterProps } from './DeckFooter.types';

/**
 * Нижний блок поверх списка (раздел 7): градиент от прозрачного к фону, «Дальше» и подсказка.
 * Неактивная кнопка не показывает ошибку, а ведёт к первой незавершённой карте.
 */
export function DeckFooter({ title, ready, hint, onNext, onBlocked, intro }: DeckFooterProps) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      style={[styles.footer, { paddingBottom: 18 + insets.bottom }]}
      pointerEvents="box-none"
      entering={intro ? FadeIn.delay(TRANSITION.chromeStart).duration(TRANSITION.chromeDuration) : undefined}
    >
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="deck-footer" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={DECK_UI.screen} stopOpacity={0} />
            <Stop offset="0.3" stopColor={DECK_UI.screen} stopOpacity={1} />
            <Stop offset="1" stopColor={DECK_UI.screen} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#deck-footer)" />
      </Svg>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !ready }}
        accessibilityHint={hint}
        onPress={ready ? onNext : onBlocked}
        style={[styles.button, ready ? styles.buttonOn : styles.buttonOff]}
      >
        <Text style={[styles.buttonText, ready ? styles.buttonTextOn : styles.buttonTextOff]}>{title}</Text>
      </Pressable>
      <Text style={[styles.hint, { color: ready ? DECK_UI.heal : DECK_UI.secondary }]} importantForAccessibility="no">
        {hint}
      </Text>
    </Animated.View>
  );
}
