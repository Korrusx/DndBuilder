import { Text } from 'react-native';

import { DECK_COLORS } from '../../config/deckColors';
import { cardBody, cardTitle } from '../../lib/cardText';
import { t } from '@/shared/i18n';
import { ChoiceActions } from './ChoiceActions';
import { styles } from './LevelUpCardView.styles';
import type { CardPartProps } from './LevelUpCardView.types';

/** Выбор (раздел 6.3): название, что выбрать, «Выбрать…» или выбранное чипами. */
export function ChoiceBody({ card, context, picked, kept, note, animate, onChoose, onKeep }: CardPartProps) {
  const colors = DECK_COLORS.choice;
  const body = cardBody(card);
  return (
    <>
      <Text style={[styles.title, { color: colors.title }]}>{cardTitle(card, context)}</Text>
      {body ? (
        <Text style={styles.body} numberOfLines={2}>
          {body}
        </Text>
      ) : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}
      {card.choice ? (
        <ChoiceActions
          choice={card.choice}
          picked={picked}
          kept={kept}
          animate={animate}
          chooseTitle={t('levelUpDeck.screen.chooseMore')}
          onChoose={onChoose}
          onKeep={onKeep}
        />
      ) : null}
    </>
  );
}
