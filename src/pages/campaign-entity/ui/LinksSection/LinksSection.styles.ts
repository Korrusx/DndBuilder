import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: { color: colors.textSecondary, fontFamily: fonts.textMedium, fontSize: 12, letterSpacing: 1 },
  list: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  row: {
    minHeight: sizes.touchMin + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginLeft: 56 },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1, color: colors.text, fontFamily: fonts.textMedium, fontSize: 15 },
  label: { color: colors.textSecondary, fontFamily: fonts.text, fontSize: 13, maxWidth: '45%', textAlign: 'right' },
  quest: { color: colors.accent },
});
