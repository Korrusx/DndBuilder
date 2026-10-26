import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './ExpandableRow.styles';
import type { ExpandableRowProps } from './ExpandableRow.types';

/** Строка умения или особенности: название и одна строка; по нажатию на месте раскрывается полный текст. */
export function ExpandableRow({ title, summary, text, note }: ExpandableRowProps) {
  const [open, setOpen] = useState(false);
  // Если полный текст и есть эта строка — раскрывать нечего.
  const expandable = text.trim() !== '' && text.trim() !== summary.trim();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open, disabled: !expandable }}
      disabled={!expandable}
      onPress={() => setOpen((v) => !v)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.head}>
        <AppText style={styles.title}>{title}</AppText>
        {note ? (
          <AppText variant="secondary" style={styles.note}>
            {note}
          </AppText>
        ) : null}
        {expandable ? <AppText style={styles.chevron}>{open ? '▴' : '▾'}</AppText> : null}
      </View>
      {open ? <AppText style={styles.text}>{text}</AppText> : <AppText variant="secondary">{summary}</AppText>}
    </Pressable>
  );
}
