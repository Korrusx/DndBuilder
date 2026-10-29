import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  link: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentBg,
    borderWidth: 1,
    borderColor: colors.accentBg,
  },
  start: { backgroundColor: colors.surface, borderColor: colors.border },
  name: { flex: 1, color: colors.accent, fontFamily: fonts.textMedium, fontSize: 15 },
  startText: { color: colors.textSecondary },
  chevron: { color: colors.accent, fontSize: 20 },
});
