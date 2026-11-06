import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { t } from '@/shared/i18n';

import { DECK_UI } from '../../config/deckColors';
import { groupGrowthRows, growthParts } from '../../lib/deckSummary';
import { ChangeRow } from '../ChangeRow/ChangeRow';
import { styles } from './GrowthCard.styles';
import type { GrowthCardProps } from './GrowthCard.types';

/**
 * Карта роста (раздел 6.1): всегда открыта, без рубашки. Главная строка — бонус мастерства (или первая),
 * остальные числа — в раскрывающемся списке по группам.
 */
export function GrowthCard({ card, open, onToggle, context }: GrowthCardProps) {
  const { main, rest } = growthParts(card.rows ?? []);
  const label = open ? t('levelUpDeck.screen.collapse') : t('levelUpDeck.screen.changed', { count: rest.length });
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.square} />
        <Text style={styles.kicker}>{t('levelUpDeck.tag.growth').toLocaleUpperCase()}</Text>
      </View>
      {main ? <ChangeRow row={main} context={context} /> : null}
      {open ? (
        <View style={styles.list}>
          {groupGrowthRows(rest).map((group) => (
            <View key={group.id}>
              <Text style={styles.group}>{t(`levelUpDeck.screen.group.${group.id}`).toLocaleUpperCase()}</Text>
              {group.rows.map((row, i) => (
                <ChangeRow key={i} row={row} context={context} size="list" />
              ))}
            </View>
          ))}
        </View>
      ) : null}
      {rest.length ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPress={onToggle}
          hitSlop={6}
          style={styles.toggle}
        >
          <Text style={styles.toggleText}>{label}</Text>
          <Feather name={open ? 'chevron-up' : 'chevron-down'} size={12} color={DECK_UI.soft} />
        </Pressable>
      ) : null}
    </View>
  );
}
