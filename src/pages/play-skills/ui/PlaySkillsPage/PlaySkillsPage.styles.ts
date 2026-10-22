import { StyleSheet } from 'react-native';

import { colors, fonts, radius, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  save: {
    minHeight: sizes.touchMin,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface2,
  },
  saveProficient: { backgroundColor: colors.accentBg },
  saveText: { fontFamily: fonts.textMedium, fontSize: 14, color: colors.text },
  saveProficientText: { color: colors.accent },
  skillName: { flex: 1, color: colors.text },
  skillNameDim: { flex: 1, color: colors.textSecondary },
  rowPressed: { backgroundColor: colors.surface2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.touchMin + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  mark: { width: 16, color: colors.accent },
  bonus: { fontFamily: fonts.displayBold, fontSize: 17, color: colors.text, width: 44, textAlign: 'right' },
  fill: { flex: 1 },
  gapSm: { gap: spacing.sm },
  muted: { color: colors.textSecondary },
});
