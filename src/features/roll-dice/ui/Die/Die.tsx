import { View } from 'react-native';

import { AppText } from '@/shared/ui';

import { styles } from './Die.styles';
import type { DieProps } from './Die.types';

export function Die({ value, dropped }: DieProps) {
  return (
    <View style={[styles.die, dropped && styles.dieDropped]}>
      <AppText style={[styles.dieValue, dropped && styles.dieValueDropped]}>{value}</AppText>
    </View>
  );
}
