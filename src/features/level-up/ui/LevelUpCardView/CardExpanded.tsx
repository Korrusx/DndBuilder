import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { t } from '@/shared/i18n';

import { DECK_MOTION } from '../../config/constants';
import { DECK_COLORS, DECK_UI } from '../../config/deckColors';
import { cardOpenLabel } from '../../lib/deckSummary';
import { ChoiceBody } from './ChoiceBody';
import { FeatureBody } from './FeatureBody';
import { styles } from './LevelUpCardView.styles';
import type { CardPartProps } from './LevelUpCardView.types';
import { MagicBody } from './MagicBody';

/** Развёрнутая карта: шапка «ТИП · ИСТОЧНИК» с состоянием (нажатие сворачивает) и содержимое по типу. */
export function CardExpanded(props: CardPartProps) {
  const { card, fresh, settled, animate, onToggle } = props;
  const colors = DECK_COLORS[card.type];
  // Вершина: при открытии рамка один раз вспыхивает (раздел 8).
  const flash = useSharedValue(0);
  const flashing = card.type === 'capstone' && !!fresh && animate;
  useEffect(() => {
    if (flashing) {
      const half = { duration: DECK_MOTION.capstoneFlash / 2 };
      flash.set(withSequence(withTiming(1, half), withTiming(0, half)));
    }
  }, [flashing, flash]);
  const glow = useAnimatedStyle(() => ({ opacity: flash.get(), shadowOpacity: flash.get() }));
  const status =
    card.choice && settled ? t('levelUpDeck.screen.choiceDone') : fresh ? t('levelUpDeck.screen.justNow') : '';
  return (
    <View
      style={[
        styles.expanded,
        { backgroundColor: colors.bg, borderColor: colors.accent, borderStyle: colors.dashed ? 'dashed' : 'solid' },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: true }}
        onPress={onToggle}
        hitSlop={{ top: 12, bottom: 12 }}
        style={styles.head}
      >
        <View style={[styles.square, { backgroundColor: colors.accent }]} />
        <Text style={[styles.headLabel, { color: colors.accent }]} numberOfLines={1}>
          {cardOpenLabel(card).toLocaleUpperCase()}
        </Text>
        {status ? (
          <Text style={[styles.status, { color: card.choice && settled ? DECK_UI.heal : colors.dim }]}>{status}</Text>
        ) : null}
      </Pressable>
      {flashing ? <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, glow]} /> : null}
      {card.type === 'magic' ? (
        <MagicBody {...props} />
      ) : card.type === 'choice' ? (
        <ChoiceBody {...props} />
      ) : (
        <FeatureBody {...props} />
      )}
    </View>
  );
}
