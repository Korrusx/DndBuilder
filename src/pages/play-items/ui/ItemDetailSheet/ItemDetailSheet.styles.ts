import { StyleSheet } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  iconWrap: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: radius.card,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    backgroundColor: colors.surface2,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statText: {
    fontFamily: fonts.textMedium,
    fontSize: 13,
    color: colors.text,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qtyLabel: {
    flex: 1,
    fontFamily: fonts.text,
    fontSize: 14,
    color: colors.textSecondary,
  },
  qtyValue: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
    minWidth: 32,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  accentStat: {
    backgroundColor: colors.accentBg,
  },
  accentStatText: {
    color: colors.accent,
  },
});
