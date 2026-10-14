import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  result: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  diceRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  total: { fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 64, color: colors.text },
  rolling: { minHeight: 160, justifyContent: 'center' },
  nat: { fontFamily: fonts.textBold, fontSize: 16 },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  fill: { flex: 1 },
});
