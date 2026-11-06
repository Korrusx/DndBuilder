import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t } from '@/shared/i18n';

import { DECK_UI } from '../../config/deckColors';
import { styles } from './HpRow.styles';
import type { HpRowProps } from './HpRow.types';

/** Хиты одной строкой (раздел 5.1): галочка, «36 → 44», «+8». Хиты не решены — кнопка «Бросить». */
export function HpRow({ card, decided, onRoll }: HpRowProps) {
  const hp = card.hp;
  const title = t('levelUpDeck.hp.title');
  return (
    <View
      style={styles.row}
      accessible={decided}
      accessibilityLabel={hp ? `${title} ${hp.maxBefore} → ${hp.maxAfter}, +${hp.gain}` : title}
    >
      {decided ? (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 12l5 5 9-10"
            stroke={DECK_UI.heal}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {decided && hp ? (
        <>
          <Text style={styles.numbers}>
            {hp.maxBefore} → {hp.maxAfter}
          </Text>
          <Text style={styles.gain}>+{hp.gain}</Text>
        </>
      ) : (
        <Pressable accessibilityRole="button" onPress={onRoll} hitSlop={4} style={styles.roll}>
          <Text style={styles.rollText}>{t('levelUpDeck.screen.roll')}</Text>
        </Pressable>
      )}
    </View>
  );
}
