import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  background: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
