import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  input: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: fonts.text,
    fontSize: 16,
  },
  multiline: { minHeight: 140, textAlignVertical: 'top', borderRadius: radius.card - 4 },
});
