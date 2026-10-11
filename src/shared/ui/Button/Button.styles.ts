import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent, minHeight: sizes.buttonPrimary },
  danger: {
    backgroundColor: colors.damageBg,
    borderWidth: 1,
    borderColor: colors.damage,
    minHeight: sizes.touchMin + 4,
  },
  secondary: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: sizes.touchMin + 4,
  },
  label: { fontFamily: fonts.textBold, fontSize: 16 },
});
