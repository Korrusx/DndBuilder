import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  big: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.accent },
  gapSm: { gap: spacing.sm },
  fill: { flex: 1 },
  muted: { color: colors.textSecondary },
  bagHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  bagHeaderText: {
    flex: 1,
    fontFamily: fonts.textBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  bagChevron: {
    fontFamily: fonts.text,
    fontSize: 18,
    color: colors.textSecondary,
  },
  noWeaponHint: {
    fontFamily: fonts.text,
    fontSize: 13,
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
  },
});
