import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { t } from '@/shared/i18n';

import { DECK_COLORS, DECK_UI } from '../../config/deckColors';
import { rowLabel } from '../../lib/cardText';
import { slotLines } from '../../lib/deckSummary';
import type { CardRow } from '../../model/types';
import { ChangeRow } from '../ChangeRow/ChangeRow';
import { ChipList } from '../ChipList/ChipList';
import { ChoiceActions } from './ChoiceActions';
import { styles } from './LevelUpCardView.styles';
import type { CardPartProps } from './LevelUpCardView.types';

const limitText = (row: CardRow): string => {
  if (row.label.kind !== 'limit') {
    return '';
  }
  const before = Number(row.before ?? 0);
  const after = Number(row.after);
  return row.label.limit === 'spellbook'
    ? t('levelUpDeck.screen.limit.spellbook', { count: after - before })
    : t(`levelUpDeck.screen.limit.${row.label.limit}`, { before, after });
};

const circleOf = (value: CardRow['after'] | undefined) =>
  typeof value === 'object' && value && 'circle' in value ? value.circle : 0;

/**
 * Магия (раздел 6.4): разделы ЯЧЕЙКИ, НОВЫЕ ЗАКЛИНАНИЯ, ВСЕГДА ПОДГОТОВЛЕНО, РОСТ ЗАГОВОРОВ через разделитель.
 */
export function MagicBody({ card, slots, picked, kept, context, animate, onChoose, onKeep }: CardPartProps) {
  const colors = DECK_COLORS.magic;
  const rows = card.rows ?? [];
  const lines = slots ? slotLines(slots.before, slots.after) : [];
  const pact = rows.find((row) => row.label.kind === 'pact');
  const limits = rows.filter((row) => row.label.kind === 'limit');
  const always = rows.filter((row) => row.label.kind === 'spell');
  const growth = rows.filter((row) => !['slots', 'pact', 'limit', 'spell'].includes(row.label.kind));
  const caption = (text: string) => (
    <Text style={[styles.caption, { color: DECK_UI.magicCaption }]}>{text.toLocaleUpperCase()}</Text>
  );

  const sections: { key: string; node: ReactNode }[] = [];
  if (lines.length || pact) {
    sections.push({
      key: 'slots',
      node: (
        <View style={styles.section}>
          {caption(t('levelUpDeck.screen.slots'))}
          {lines.map((line) => {
            const opened = line.before === 0;
            const added = line.count - line.before;
            return (
              <View key={line.circle} style={styles.slotRow}>
                <Text style={[styles.slotLabel, opened && styles.slotLabelNew]}>
                  {t('levelUpDeck.screen.circle', { circle: line.circle })}
                </Text>
                <View style={styles.dots}>
                  {Array.from({ length: line.count }, (_, n) => (
                    <View
                      key={n}
                      style={[
                        styles.slotDot,
                        { backgroundColor: colors.accent },
                        n >= line.before && styles.slotDotNew,
                      ]}
                    />
                  ))}
                </View>
                {added > 0 ? (
                  <Text style={[styles.slotNote, { color: colors.accent }]}>
                    {opened ? t('levelUpDeck.screen.slotOpened') : `+${added}`}
                  </Text>
                ) : null}
              </View>
            );
          })}
          {pact ? (
            <Text style={styles.pact}>
              {t('levelUpDeck.screen.pactRow', { before: circleOf(pact.before), after: circleOf(pact.after) })}
            </Text>
          ) : null}
        </View>
      ),
    });
  }
  if (card.choice || limits.length) {
    sections.push({
      key: 'spells',
      node: (
        <View style={styles.section}>
          {caption([t('levelUpDeck.screen.newSpells'), ...limits.map(limitText)].join(' · '))}
          {card.choice ? (
            <ChoiceActions
              choice={card.choice}
              picked={picked}
              kept={kept}
              animate={animate}
              magic
              chooseTitle={t('levelUpDeck.magic.pickSpells')}
              onChoose={onChoose}
              onKeep={onKeep}
            />
          ) : null}
        </View>
      ),
    });
  }
  if (always.length) {
    sections.push({
      key: 'always',
      node: (
        <View style={styles.section}>
          {caption(t('levelUpDeck.screen.alwaysPrepared'))}
          <ChipList moreColor={colors.accent} height={30}>
            {always.map((row, i) => (
              <View key={i} style={[styles.always, { backgroundColor: DECK_UI.alwaysChip }]}>
                <Text style={[styles.pickedText, { color: DECK_UI.alwaysChipText }]}>
                  {rowLabel(row.label, context)}
                </Text>
              </View>
            ))}
          </ChipList>
        </View>
      ),
    });
  }
  if (growth.length) {
    sections.push({
      key: 'growth',
      node: (
        <View style={styles.section}>
          {caption(
            growth.every((row) => row.label.kind === 'cantrip')
              ? t('levelUpDeck.screen.cantripGrowth')
              : t('levelUpDeck.tag.growth'),
          )}
          {growth.map((row, i) => (
            <ChangeRow key={i} row={row} context={context} color={colors.title} />
          ))}
        </View>
      ),
    });
  }

  return (
    <View style={styles.magic}>
      {sections.map((section, i) => (
        <Fragment key={section.key}>
          {i > 0 ? <View style={styles.divider} /> : null}
          {section.node}
        </Fragment>
      ))}
    </View>
  );
}
