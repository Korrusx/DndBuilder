import { StyleSheet } from 'react-native';

import { colors, fonts, radius, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  input: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.text,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.touchMin,
    paddingHorizontal: spacing.md,
  },
  customRow: { borderRadius: 14, backgroundColor: colors.accentBg },
  list: { borderRadius: radius.card - 4, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  textHeal: { color: colors.heal },
  customItem: { flex: 1, color: colors.accent },
  fill: { flex: 1 },
  size12: { fontSize: 12 },
  padMd: { padding: spacing.md },
});
