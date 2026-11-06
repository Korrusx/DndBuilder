import { ScrollView, View } from 'react-native';

import { DECK_TILE_WIDTH, DECK_TILES_FIT } from '../../config/constants';
import { isChoiceSettled } from '../../lib/deckProgress';
import { DeckTile } from './DeckTile';
import { styles } from './DeckTiles.styles';
import type { DeckTilesProps } from './DeckTiles.types';

/** Лента колоды (раздел 4): до шести карт — равные колонки, больше — прокрутка плитками по 52. */
export function DeckTiles({ cards, current, settled, onSelect }: DeckTilesProps) {
  const tile = (card: (typeof cards)[number], width?: number) => (
    <DeckTile
      key={card.id}
      card={card}
      current={card.id === current}
      needsChoice={!isChoiceSettled(card, settled)}
      width={width}
      onPress={() => onSelect(card.id)}
    />
  );
  if (cards.length > DECK_TILES_FIT) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        accessibilityRole="tablist"
      >
        {cards.map((card) => tile(card, DECK_TILE_WIDTH))}
      </ScrollView>
    );
  }
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {cards.map((card) => (
        <View key={card.id} style={styles.cell}>
          {tile(card)}
        </View>
      ))}
    </View>
  );
}
