import { StyleSheet } from 'react-native';

import { spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  fill: { flex: 1 },
  centered: { textAlign: 'center' },
});
