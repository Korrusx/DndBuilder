import { StyleSheet } from 'react-native';

import { spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 6, borderRadius: 3 },
});
