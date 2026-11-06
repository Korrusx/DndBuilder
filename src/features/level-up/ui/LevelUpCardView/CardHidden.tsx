import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { t } from '@/shared/i18n';

import { DECK_COLORS, DECK_UI } from '../../config/deckColors';
import { cardTypeLabel } from '../../lib/deckSummary';
import { Stripes } from '../Stripes/Stripes';
import { styles } from './LevelUpCardView.styles';
import type { CardPartProps } from './LevelUpCardView.types';

/** Рубашка (раздел 5.2): тип карты без названия — новинка остаётся сюрпризом. */
export function CardHidden({ card, settled, onOpen }: CardPartProps) {
  const colors = DECK_COLORS[card.type];
  const type = cardTypeLabel(card);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('levelUpDeck.screen.a11yHidden', { type })}
      onPress={onOpen}
      style={[styles.hidden, { borderColor: colors.border, backgroundColor: colors.stripeA }]}
    >
      <Stripes colors={[colors.stripeA, colors.stripeB]} width={6} />
      <View style={[styles.square, { backgroundColor: colors.accent }]} />
      <View style={styles.lines}>
        <Text style={[styles.kicker, { color: colors.accent }]} numberOfLines={1}>
          {type.toLocaleUpperCase()}
        </Text>
        <Text style={styles.tapHint}>{t('levelUpDeck.screen.tapToOpen')}</Text>
      </View>
      {!settled ? (
        <View style={styles.needs}>
          <View style={styles.needsDot} />
          <Text style={styles.needsText}>{t('levelUpDeck.needsChoice')}</Text>
        </View>
      ) : null}
      <Feather name="refresh-cw" size={18} color={DECK_UI.muted} />
    </Pressable>
  );
}
