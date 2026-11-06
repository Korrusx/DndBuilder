import { Fragment, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/shared/config';
import { t } from '@/shared/i18n';

import { rowLabel, rowValue } from '../../lib/cardText';
import type { CardRow } from '../../model/types';
import { styles } from './RowList.styles';
import type { RowListProps } from './RowList.types';

/** Строки «было → стало»; у строки бонуса мастерства раскрывается список всех изменившихся чисел. */
export function RowList({ rows, context, accent = colors.text, boxed }: RowListProps) {
  const [open, setOpen] = useState<number | null>(null);
  const line = (row: CardRow, small: boolean) => (
    <>
      {row.before === undefined ? null : (
        <>
          <Text style={styles.before}>{rowValue(row.label, row.before)}</Text>
          <Text style={styles.arrow}>→</Text>
        </>
      )}
      <Text style={[styles.after, { color: small ? colors.text : accent }]}>{rowValue(row.label, row.after)}</Text>
    </>
  );
  return (
    <View style={[styles.list, boxed && styles.boxed]}>
      {rows.map((row, i) => (
        <Fragment key={`${JSON.stringify(row.label)}`}>
          {boxed && i > 0 ? <View style={styles.divider} /> : null}
          <Pressable
            accessibilityRole={row.details?.length ? 'button' : undefined}
            disabled={!row.details?.length}
            onPress={() => setOpen(open === i ? null : i)}
            style={styles.row}
          >
            <View style={styles.labelBox}>
              <Text style={styles.label}>{rowLabel(row.label, context)}</Text>
              {row.details?.length ? (
                <Text style={styles.more}>
                  {t('levelUpDeck.row.changed', { count: row.details.length })} {open === i ? '‹' : '›'}
                </Text>
              ) : null}
            </View>
            {line(row, false)}
          </Pressable>
          {open === i && row.details ? (
            <View style={styles.details}>
              {row.details.map((detail) => (
                <View key={JSON.stringify(detail.label)} style={styles.row}>
                  <Text style={[styles.detailLabel, styles.labelBox]}>{rowLabel(detail.label, context)}</Text>
                  {line(detail, true)}
                </View>
              ))}
            </View>
          ) : null}
        </Fragment>
      ))}
    </View>
  );
}
