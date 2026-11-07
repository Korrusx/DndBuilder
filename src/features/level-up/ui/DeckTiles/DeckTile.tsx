import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { t } from '@/shared/i18n';
import { formatDie } from '@/shared/lib/dice';

import { DECK_COLORS, DECK_UI } from '../../config/deckColors';
import { cardShortTitle, tileLabelFits } from '../../lib/cardText';
import { Stripes } from '../Stripes/Stripes';
import { styles } from './DeckTiles.styles';
import type { DeckTileProps } from './DeckTiles.types';

/** Плитка ленты колоды: «✓» — открыта, «?» — закрыта, рамка акцентом — развёрнута в списке. */
export function DeckTile({ card, current, needsChoice, hpDie, width, onPress }: DeckTileProps) {
  const colors = DECK_COLORS[card.type];
  // Хиты не прячутся под рубашку: до броска — значок кости, рамка 2 акцентом.
  const hidden = card.state === 'hidden' && !hpDie;
  const typeLabel = t(`levelUpDeck.type.${card.type}`);
  const title = hidden ? typeLabel : cardShortTitle(card);
  // Название не влезло без разрыва слова — плитка сама показывает тип карты.
  const [brokenTitle, setBrokenTitle] = useState<string | null>(null);
  const label = brokenTitle === title ? typeLabel : title;
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
        (current || !!hpDie) && styles.tileCurrent,
        hpDie ? { borderColor: colors.accent } : null,
      ]}
    >
      {hidden ? <Stripes colors={[colors.stripeA, colors.stripeB]} width={5} /> : null}
      <Text style={[styles.mark, { color: hidden ? colors.dim : colors.accent }]}>
        {hpDie ? formatDie(hpDie) : hidden ? '?' : '✓'}
      </Text>
      <Text
        style={[styles.label, { color: colors.accent }]}
        numberOfLines={2}
        onTextLayout={(e) => {
          if (label === title && label !== typeLabel && !tileLabelFits(e.nativeEvent.lines, label)) {
            setBrokenTitle(title);
          }
        }}
      >
        {label}
      </Text>
      {needsChoice ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}
