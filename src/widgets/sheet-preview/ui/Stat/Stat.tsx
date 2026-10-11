import { View } from 'react-native';

import { AppText } from '@/shared/ui';

import { styles } from './Stat.styles';
import type { StatProps } from './Stat.types';

export function Stat({ label, value, note }: StatProps) {
  return (
    <View style={styles.stat}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText variant="secondary" style={styles.label}>
        {label}
      </AppText>
      {note ? (
        <AppText variant="secondary" style={styles.note}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}
