import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headText: { flex: 1, gap: 2 },
  badgeRow: { flexDirection: 'row' },
  block: { gap: spacing.xs },
  blockTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
});
