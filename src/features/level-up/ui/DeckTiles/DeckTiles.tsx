import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { DECK_TILE_WIDTH, DECK_TILES_FIT, TRANSITION } from '../../config/constants';
import { isChoiceSettled } from '../../lib/deckProgress';
import { DeckTile } from './DeckTile';
import { styles } from './DeckTiles.styles';
import type { DeckTilesProps } from './DeckTiles.types';

/** Лента колоды (раздел 4): до шести карт — равные колонки, больше — прокрутка плитками по 52. */
/** Появление плитки: scale 0,6 → 1 (ZoomIn масштабирует без прозрачности). */
const appear = (delay: number) =>
  ZoomIn.delay(delay)
    .duration(TRANSITION.tileDuration)
    .withInitialValues({ transform: [{ scale: 0.6 }] });

export function DeckTiles({ cards, current, settled, onSelect, appearAt }: DeckTilesProps) {
  const wrap = (i: number, node: ReactNode, style?: object) => (
    <Animated.View
      key={cards[i].id}
      style={style}
      entering={appearAt === undefined ? undefined : appear(appearAt + i * TRANSITION.tileStep)}
    >
      {node}
    </Animated.View>
  );
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
        {cards.map((card, i) => wrap(i, tile(card, DECK_TILE_WIDTH)))}
      </ScrollView>
    );
  }
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {cards.map((card, i) => wrap(i, tile(card), styles.cell))}
    </View>
  );
}
