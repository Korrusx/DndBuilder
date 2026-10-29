import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: spacing.xs },
  gutter: { width: 28, alignItems: 'center', paddingTop: spacing.lg + 2 },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.accent },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  time: { color: colors.textSecondary, fontFamily: fonts.textBold, fontSize: 14 },
  tag: { color: colors.accent, fontFamily: fonts.textMedium, fontSize: 12 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  photo: { width: 72, height: 72, borderRadius: 10, backgroundColor: colors.surface2 },
});
