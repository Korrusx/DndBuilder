import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardCompact: { padding: spacing.md, borderRadius: 16, flex: 1 },
  title: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titleText: { flex: 1 },
  cardPattern: { overflow: 'hidden' },
  cardSelected: { borderColor: colors.accent, backgroundColor: colors.accentBg },
});
