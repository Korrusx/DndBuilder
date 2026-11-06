import { Pressable, ScrollView } from 'react-native';

import { t } from '@/shared/i18n';

import { cardShortTitle } from '../../lib/cardText';
import { CardBack } from '../CardBack/CardBack';
import { styles } from './DeckStrip.styles';
import type { DeckStripProps } from './DeckStrip.types';

/** Лента всей колоды уровня (макет У8): маленькие карты, текущая приподнята. */
export function DeckStrip({ cards, current, onSelect }: DeckStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
      {cards.map((card, i) => (
        <Pressable
          key={card.id}
          accessibilityRole="button"
          accessibilityLabel={cardShortTitle(card)}
          accessibilityState={{ selected: i === current }}
          onPress={() => onSelect(i)}
        >
          <CardBack
            small
            open={card.state !== 'hidden'}
            type={card.type}
            label={card.state === 'hidden' ? t(`levelUpDeck.type.${card.type}`) : cardShortTitle(card)}
            dot={!!card.choice && card.choice.required && !card.choice.done}
            current={i === current}
            style={styles.item}
          />
        </Pressable>
      ))}
      <Pressable accessibilityRole="button" onPress={() => onSelect(cards.length)}>
        <CardBack
          small
          type="summary"
          label={t('levelUpDeck.type.summary')}
          current={current === cards.length}
          style={styles.item}
        />
      </Pressable>
    </ScrollView>
  );
}
