import { colors, fonts, sizes, spacing } from '@/shared/config/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: spacing.sm },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.accent },
  nameInput: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 18,
  },
  issue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.damageBg,
    borderRadius: 14,
    paddingLeft: spacing.md,
    minHeight: sizes.touchMin,
  },
  fix: { minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: spacing.md },
});
