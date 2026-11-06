import { Pressable, Text, View } from 'react-native';

import { t } from '@/shared/i18n';

import { DECK_COLORS, DECK_UI } from '../../config/deckColors';
import { cardShortTitle } from '../../lib/cardText';
import { Stripes } from '../Stripes/Stripes';
import { styles } from './DeckTiles.styles';
import type { DeckTileProps } from './DeckTiles.types';

/** Плитка ленты колоды: «✓» — открыта, «?» — закрыта, рамка акцентом — развёрнута в списке. */
export function DeckTile({ card, current, needsChoice, width, onPress }: DeckTileProps) {
  const colors = DECK_COLORS[card.type];
  const hidden = card.state === 'hidden';
  const label = hidden ? t(`levelUpDeck.type.${card.type}`) : cardShortTitle(card);
  const fill = current && (card.type === 'feature' || card.type === 'choice') ? DECK_UI.accentPlate : colors.bg;
  const a11y = [
    t(hidden ? 'levelUpDeck.screen.a11yTileHidden' : 'levelUpDeck.screen.a11yTileOpen', { title: label }),
    needsChoice ? t('levelUpDeck.screen.a11yNeedsChoice') : '',
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ selected: current }}
      onPress={onPress}
      style={[
        styles.tile,
        width ? { width } : null,
        { borderColor: current ? colors.accent : colors.border, backgroundColor: hidden ? colors.stripeA : fill },
        current && styles.tileCurrent,
      ]}
    >
      {hidden ? <Stripes colors={[colors.stripeA, colors.stripeB]} width={5} /> : null}
      <Text style={[styles.mark, { color: hidden ? colors.dim : colors.accent }]}>{hidden ? '?' : '✓'}</Text>
      <Text style={[styles.label, { color: colors.accent }]} numberOfLines={2}>
        {label}
      </Text>
      {needsChoice ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}
