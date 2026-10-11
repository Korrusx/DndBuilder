import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyValue: { fontFamily: fonts.display, fontSize: 15, color: colors.text, minWidth: 26, textAlign: 'center' },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  coinInput: {
    width: 96,
    minHeight: sizes.touchMin,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 16,
    textAlign: 'right',
    paddingHorizontal: spacing.md,
  },
});
