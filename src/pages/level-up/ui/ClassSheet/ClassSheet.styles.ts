import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowOn: { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: colors.accentBg },
  rowOff: { opacity: 0.5 },
  lines: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: fonts.textBold, fontSize: 15, color: colors.text },
  note: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
});
