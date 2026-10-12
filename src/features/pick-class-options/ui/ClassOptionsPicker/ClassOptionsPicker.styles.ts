import { StyleSheet } from 'react-native';

import { spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fill: { flex: 1, flexDirection: 'row' },
});
