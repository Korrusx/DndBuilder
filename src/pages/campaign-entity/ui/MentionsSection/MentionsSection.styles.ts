import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  title: { color: colors.textSecondary, fontFamily: fonts.textMedium, fontSize: 12, letterSpacing: 1 },
  hit: { flexDirection: 'row', gap: spacing.md },
  where: { width: 40, color: colors.textSecondary, fontFamily: fonts.textBold, fontSize: 14 },
  snippet: { flex: 1, color: colors.text, fontFamily: fonts.text, fontSize: 15, lineHeight: 21 },
});
