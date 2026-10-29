import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  input: {
    minHeight: sizes.touchMin + 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.displayBold,
    fontSize: 22,
  },
  soft: { color: colors.damage, fontFamily: fonts.text, fontSize: 14 },
});
