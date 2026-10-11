import { View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './Badge.styles';
import type { BadgeProps } from './Badge.types';

export function Badge({ label }: BadgeProps) {
  return (
    <View style={styles.badge}>
      <AppText style={styles.badgeLabel}>{label}</AppText>
    </View>
  );
}
