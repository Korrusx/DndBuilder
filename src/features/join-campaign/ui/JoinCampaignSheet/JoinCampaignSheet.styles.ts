import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: {
    minHeight: sizes.touchMin + 8,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  rowName: { color: colors.text, fontFamily: fonts.textMedium, fontSize: 16 },
  input: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.text,
    fontSize: 16,
  },
});
