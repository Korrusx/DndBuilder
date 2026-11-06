import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { DECK_COLORS } from '../../config/deckColors';
import { cardTitle } from '../../lib/cardText';
import { cardSummary } from '../../lib/deckSummary';
import { styles } from './LevelUpCardView.styles';
import type { CardPartProps } from './LevelUpCardView.types';

/** Открытая свёрнутая карта: название и сводка одной-двумя строками, стрелка вниз. */
export function CardCollapsed({ card, picked, kept, context, onToggle }: CardPartProps) {
  const colors = DECK_COLORS[card.type];
  const title = cardTitle(card, context);
  const summary = cardSummary(card, { picked, kept, context });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${summary}`}
      accessibilityState={{ expanded: false }}
      onPress={onToggle}
      style={[
        styles.collapsed,
        { backgroundColor: colors.bg, borderColor: colors.border, borderStyle: colors.dashed ? 'dashed' : 'solid' },
      ]}
    >
      <View style={[styles.square, { backgroundColor: colors.accent }]} />
      <View style={styles.lines}>
        <Text style={[styles.name, { color: colors.title }]}>{title}</Text>
        {summary ? (
          <Text style={[styles.summary, { color: colors.accent }]} numberOfLines={2}>
            {summary}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-down" size={16} color={colors.dim} />
    </Pressable>
  );
}
