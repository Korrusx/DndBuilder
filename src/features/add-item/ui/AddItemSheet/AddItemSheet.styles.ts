import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

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
  textHeal: { color: colors.heal },
  customItem: { flex: 1, color: colors.accent },
  padMd: { padding: spacing.md },
});
