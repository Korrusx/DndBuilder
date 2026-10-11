import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  chip: {
    minHeight: sizes.touchMin,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipSelected: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  chipLabel: { fontFamily: fonts.textMedium, fontSize: 15, color: colors.text },
  chipNote: { fontFamily: fonts.text, fontSize: 11, color: colors.textSecondary },
});
