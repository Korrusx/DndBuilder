import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  result: { paddingVertical: spacing.md },
  resultBody: { alignItems: 'center', gap: spacing.sm },
  hidden: { opacity: 0 },
  diceRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  total: { fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 64, color: colors.text },
  rolling: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  fill: { flex: 1 },
});
