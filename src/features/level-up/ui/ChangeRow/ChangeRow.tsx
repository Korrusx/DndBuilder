import { Text, View } from 'react-native';

import { rowLabel, rowValue } from '../../lib/cardText';
import { styles } from './ChangeRow.styles';
import type { ChangeRowProps } from './ChangeRow.types';

/** Строка «было → стало»: название, прежнее значение, стрелка, новое. Без прежнего — только новое. */
export function ChangeRow({ row, context, size = 'card', color }: ChangeRowProps) {
  const list = size === 'list';
  const label = rowLabel(row.label, context);
  const after = rowValue(row.label, row.after);
  const before = row.before === undefined ? undefined : rowValue(row.label, row.before);
  return (
    <View
      style={[styles.row, list && styles.rowList]}
      accessible
      accessibilityLabel={before === undefined ? `${label} ${after}` : `${label} ${before} → ${after}`}
    >
      <Text style={[styles.label, list && styles.labelList, color && !list ? { color } : null]}>{label}</Text>
      {before !== undefined ? (
        <>
          <Text style={[styles.before, list && styles.beforeList]}>{before}</Text>
          <Text style={[styles.arrow, list && styles.arrowList]}>→</Text>
        </>
      ) : null}
      <Text style={[styles.after, list && styles.afterList, color ? { color } : null]}>{after}</Text>
    </View>
  );
}
