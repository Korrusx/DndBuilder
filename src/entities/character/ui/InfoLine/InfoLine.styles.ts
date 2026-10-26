import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: { width: 104, fontSize: 13 },
  value: { flex: 1 },
});
