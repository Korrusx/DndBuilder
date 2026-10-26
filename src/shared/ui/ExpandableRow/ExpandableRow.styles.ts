import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    paddingVertical: spacing.sm,
    gap: 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, fontFamily: fonts.textBold, fontSize: 15, color: colors.text },
  note: { fontSize: 12 },
  chevron: { fontSize: 14, color: colors.textSecondary },
  text: { marginTop: spacing.xs, color: colors.textTertiary },
});
