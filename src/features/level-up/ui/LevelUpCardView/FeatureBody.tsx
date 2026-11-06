import { Pressable, Text, View } from 'react-native';

import { nameOf } from '@/shared/content';
import { t } from '@/shared/i18n';

import { CARD_BODY_LINES, MORE_HIT_SLOP } from '../../config/constants';
import { DECK_COLORS, DECK_UI } from '../../config/deckColors';
import { cardBody, cardFullText, cardTitle, rowLabel, tagText } from '../../lib/cardText';
import { ChangeRow } from '../ChangeRow/ChangeRow';
import { ChipList } from '../ChipList/ChipList';
import { styles } from './LevelUpCardView.styles';
import type { CardPartProps } from './LevelUpCardView.types';

/**
 * Новое умение, вид, мультикласс, вершина (разделы 6.2, 6.5, 6.6): «улучшено: …», название, описание до
 * 4 строк с «Подробнее», метки чипами, строки «было → стало».
 */
export function FeatureBody({ card, context, onMore }: CardPartProps) {
  const colors = DECK_COLORS[card.type];
  const body = cardBody(card);
  const more = cardFullText(card);
  const rows = card.rows ?? [];
  const proficiencies = rows.filter((row) => row.label.kind === 'proficiency');
  const features = rows.filter((row) => row.label.kind === 'feature');
  const changes = rows.filter((row) => row.label.kind !== 'proficiency' && row.label.kind !== 'feature');
  const plate = card.type === 'feature' || card.type === 'capstone' ? DECK_UI.accentPlate : colors.stripeB;
  return (
    <>
      {card.upgradedFrom ? (
        <Text style={[styles.upgraded, { color: colors.dim }]}>
          {t('levelUpDeck.upgraded')}: <Text style={styles.strike}>{nameOf('features', card.upgradedFrom)}</Text>
        </Text>
      ) : null}
      <Text style={[styles.title, { color: colors.title }]}>{cardTitle(card, context)}</Text>
      {body ? (
        <Text style={styles.body} numberOfLines={CARD_BODY_LINES}>
          {body}
        </Text>
      ) : null}
      {more ? (
        <Pressable accessibilityRole="button" onPress={() => onMore(card)} hitSlop={MORE_HIT_SLOP}>
          <Text style={styles.more}>{t('levelUpDeck.screen.more')}</Text>
        </Pressable>
      ) : null}
      {card.tags?.length ? (
        <ChipList moreColor={colors.accent}>
          {card.tags.map((tag) => (
            <View key={tagText(tag)} style={[styles.tag, { backgroundColor: plate }]}>
              <Text style={[styles.tagText, { color: colors.accent }]}>{tagText(tag)}</Text>
            </View>
          ))}
        </ChipList>
      ) : null}
      {proficiencies.length ? (
        <View style={styles.section}>
          <Text style={[styles.caption, { color: colors.dim }]}>
            {t('levelUpDeck.screen.proficiencies').toLocaleUpperCase()}
          </Text>
          <ChipList moreColor={colors.accent}>
            {proficiencies.map((row, i) => (
              <View key={i} style={[styles.tag, { backgroundColor: plate }]}>
                <Text style={[styles.tagText, { color: colors.accent }]}>{rowLabel(row.label, context)}</Text>
              </View>
            ))}
          </ChipList>
        </View>
      ) : null}
      {features.length ? (
        <View style={styles.section}>
          <Text style={[styles.caption, { color: colors.dim }]}>
            {t('levelUpDeck.screen.features').toLocaleUpperCase()}
          </Text>
          {features.map((row, i) => (
            <Text key={i} style={styles.line}>
              {rowLabel(row.label, context)}
            </Text>
          ))}
        </View>
      ) : null}
      {changes.map((row, i) => (
        <ChangeRow key={i} row={row} context={context} color={card.type === 'species' ? colors.title : undefined} />
      ))}
      {card.type === 'species' ? <Text style={styles.hint}>{t('levelUpDeck.speciesHint')}</Text> : null}
    </>
  );
}
