import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 36, paddingVertical: spacing.xs },
  gutter: { width: 28, alignItems: 'center' },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.iconMuted,
    backgroundColor: colors.bg,
  },
  time: { color: colors.textSecondary, fontFamily: fonts.textBold, fontSize: 14, width: 52 },
  text: { flex: 1, color: colors.textSecondary, fontFamily: fonts.text, fontSize: 14, lineHeight: 19 },
});
