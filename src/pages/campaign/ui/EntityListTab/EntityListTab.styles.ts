import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  group: {
    color: colors.textSecondary,
    fontFamily: fonts.textMedium,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  row: {
    minHeight: sizes.touchMin + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  letter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  portrait: { width: 36, height: 36 },
  letterText: { color: colors.info, fontFamily: fonts.display, fontSize: 15 },
  info: { flex: 1, paddingVertical: spacing.sm },
  name: { color: colors.text, fontFamily: fonts.textMedium, fontSize: 16 },
  empty: { color: colors.textSecondary, fontFamily: fonts.text, fontSize: 14 },
});
