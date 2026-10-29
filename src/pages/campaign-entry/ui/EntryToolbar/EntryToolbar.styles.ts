import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    minHeight: sizes.touchMin + 8,
  },
  button: { width: sizes.touchMin + 4, height: sizes.touchMin, alignItems: 'center', justifyContent: 'center' },
  at: { color: colors.accent, fontFamily: fonts.displayBold, fontSize: 22 },
  status: {
    flex: 1,
    textAlign: 'right',
    color: colors.textSecondary,
    fontFamily: fonts.text,
    fontSize: 13,
    paddingRight: spacing.sm,
  },
});
