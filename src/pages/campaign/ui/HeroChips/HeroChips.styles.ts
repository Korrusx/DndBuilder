import { StyleSheet } from 'react-native';

import { colors, fonts, radius, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: sizes.touchMin - 4,
    borderRadius: radius.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    borderWidth: 1,
  },
  hero: { backgroundColor: colors.accentBg, borderColor: '#5A4520' },
  hall: { backgroundColor: colors.surface, borderColor: colors.border, paddingLeft: spacing.md },
  letter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { color: colors.accent, fontFamily: fonts.display, fontSize: 13 },
  heroText: { color: colors.text, fontFamily: fonts.textMedium, fontSize: 14 },
  hallText: { color: colors.textSecondary, fontFamily: fonts.textMedium, fontSize: 14 },
});
