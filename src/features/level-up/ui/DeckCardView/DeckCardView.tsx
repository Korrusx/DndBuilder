import { Pressable, Text, View } from 'react-native';

import { t } from '@/shared/i18n';

import { CARD_THEMES } from '../../config/cardTheme';
import { cardBody, cardKicker, cardTitle, tagText } from '../../lib/cardText';
import { nameOf } from '@/shared/content';
import { HpSummary } from '../HpSummary/HpSummary';
import { RowList } from '../RowList/RowList';
import { SlotDots } from '../SlotDots/SlotDots';
import { styles } from './DeckCardView.styles';
import type { DeckCardViewProps } from './DeckCardView.types';

/** Лицо карты колоды: метка, название, «улучшено», описание, метки, строки «было → стало», кнопка выбора. */
export function DeckCardView({
  card,
  classLevel,
  context,
  slots,
  animate,
  onChoose,
  kept,
  onKeep,
  note,
}: DeckCardViewProps) {
  const theme = CARD_THEMES[card.type];
  const choice = card.choice;
  const status = choice
    ? choice.done && (choice.required || choice.picked > 0)
      ? t('levelUpDeck.chosen')
      : !choice.required
        ? kept
          ? t('levelUpDeck.kept')
          : t('levelUpDeck.optional')
        : t('levelUpDeck.needsChoice')
    : card.upgradedFrom
      ? t('levelUpDeck.upgraded')
      : card.type === 'species' || card.type === 'feature' || card.type === 'capstone'
        ? t('levelUpDeck.isNew')
        : '';
  const body = card.type === 'hp' || card.type === 'growth' || card.type === 'magic' ? '' : cardBody(card);
  const slotRows = card.rows?.filter((row) => row.label.kind === 'slots') ?? [];
  const otherRows = card.rows?.filter((row) => row.label.kind !== 'slots') ?? [];
  const showChoose = choice && onChoose && (choice.count > 0 || choice.problems.length > 0 || !choice.required);

  return (
    <View
      style={[
        styles.card,
        {
          borderColor:
            card.type === 'choice' || card.type === 'species' || card.type === 'capstone' ? theme.accent : theme.border,
          borderStyle: theme.dashed ? 'dashed' : 'solid',
          backgroundColor: card.type === 'choice' ? '#1E1A12' : theme.background,
        },
      ]}
    >
      <View style={styles.head}>
        <View
          style={[
            styles.kickerPill,
            {
              backgroundColor: card.type === 'choice' || card.type === 'feature' ? '#2B2416' : 'transparent',
              paddingHorizontal: card.type === 'choice' || card.type === 'feature' ? 10 : 0,
            },
          ]}
        >
          <Text style={[styles.kicker, { color: theme.accent }]}>
            {cardKicker(card, classLevel).toLocaleUpperCase()}
          </Text>
        </View>
        <View style={styles.fill} />
        {status ? <Text style={[styles.status, { color: theme.accent }]}>{status}</Text> : null}
      </View>

      <Text style={[styles.title, { color: theme.title }]}>{cardTitle(card, context)}</Text>

      {card.upgradedFrom ? (
        <View style={styles.upgraded}>
          <View style={[styles.stamp, { borderColor: theme.accent }]}>
            <Text style={[styles.stampText, { color: theme.accent }]}>
              {t('levelUpDeck.upgraded').toLocaleUpperCase()}
            </Text>
          </View>
          <Text style={styles.was}>{nameOf('features', card.upgradedFrom)}</Text>
        </View>
      ) : null}

      {body ? <Text style={styles.body}>{body}</Text> : null}

      {card.tags?.length ? (
        <View style={styles.tags}>
          {card.tags.map((tag) => (
            <View
              key={tagText(tag)}
              style={[styles.tag, { backgroundColor: card.type === 'species' ? '#232E3F' : '#232831' }]}
            >
              <Text style={[styles.tagText, { color: card.type === 'species' ? '#B5D0FF' : theme.accent }]}>
                {tagText(tag)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {card.hp ? <HpSummary hp={card.hp} /> : null}
      {slotRows.length && slots ? <SlotDots slots={slots.after} before={slots.before} animate={animate} /> : null}
      {otherRows.length ? <RowList rows={otherRows} context={context} accent={theme.title} /> : null}

      {note ? (
        <View style={styles.note}>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      ) : null}

      {showChoose ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onChoose(choice)}
          style={[styles.choose, { backgroundColor: theme.accent }]}
        >
          <Text style={styles.chooseText}>
            {choice.count > 0 && choice.picked > 0
              ? t('levelUpDeck.picked', { picked: choice.picked, count: choice.count })
              : `${t('levelUpDeck.choose')}…`}
          </Text>
        </Pressable>
      ) : null}
      {choice && !choice.required && onKeep && !kept ? (
        <Pressable accessibilityRole="button" onPress={() => onKeep(choice)} style={styles.keep}>
          <Text style={styles.keepText}>{t('levelUpDeck.keep')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
