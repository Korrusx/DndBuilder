import { StyleSheet } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  head: { fontFamily: fonts.text, fontSize: 11, color: colors.textSecondary, paddingVertical: spacing.xs },
  cell: { width: 44, textAlign: 'center' },
  dataRow: { minHeight: 56, borderTopWidth: 1, borderTopColor: colors.border },
  abbr: { fontFamily: fonts.display, fontSize: 15, color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  value: { fontFamily: fonts.display, fontSize: 16, color: colors.text, textAlign: 'center' },
  slot: { height: 40, borderRadius: 10, backgroundColor: colors.surface2, justifyContent: 'center' },
  slotTarget: { borderWidth: 1, borderColor: colors.accent },
  gapSm: { gap: spacing.sm },
  fill: { flex: 1 },
  size12: { fontSize: 12 },
});
