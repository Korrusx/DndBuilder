import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  list: { gap: 2 },
  boxed: {
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 40 },
  divider: { height: 1, backgroundColor: colors.border },
  labelBox: { flex: 1 },
  label: { fontFamily: fonts.text, fontSize: 14, color: colors.text },
  more: { fontFamily: fonts.text, fontSize: 11, color: colors.textSecondary },
  before: { fontFamily: fonts.display, fontSize: 12, color: colors.textSecondary },
  arrow: { color: '#6B737D' },
  after: { fontFamily: fonts.display, fontSize: 13 },
  details: { paddingLeft: spacing.md, paddingBottom: spacing.sm, gap: 2 },
  detailLabel: { fontFamily: fonts.text, fontSize: 13, color: colors.textSecondary },
});
