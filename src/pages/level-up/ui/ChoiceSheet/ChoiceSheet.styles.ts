import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md },
  title: { flex: 1, fontFamily: fonts.display, fontSize: 18, color: colors.text },
  counter: { fontFamily: fonts.display, fontSize: 14, color: colors.accent },
  hint: { fontFamily: fonts.text, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  preview: { gap: spacing.xs },
  side: { borderRadius: 12, backgroundColor: colors.healBg, paddingHorizontal: 12, paddingVertical: 10 },
  sideText: { fontFamily: fonts.text, fontSize: 13, lineHeight: 18, color: '#A8D9BC' },
  sideNumbers: { fontFamily: fonts.display, color: colors.heal },
});
