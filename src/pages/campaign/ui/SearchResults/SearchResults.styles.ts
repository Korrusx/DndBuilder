import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  list: { gap: spacing.md },
  hit: { flexDirection: 'row', gap: spacing.md },
  where: { width: 44, color: colors.textSecondary, fontFamily: fonts.textBold, fontSize: 13, paddingTop: 2 },
  body: { flex: 1 },
  event: { color: colors.textSecondary, fontFamily: fonts.text, fontSize: 15 },
});
