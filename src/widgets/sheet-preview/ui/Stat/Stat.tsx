import { AppText } from '@/shared/ui';
import { View } from 'react-native';
import { styles } from './Stat.styles';

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.stat}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText variant="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
        {label}
      </AppText>
      {note ? (
        <AppText variant="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}
