import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  hpTop: { flexDirection: 'row', alignItems: 'flex-end' },
  hpValue: { fontFamily: fonts.displayBold, fontSize: 48, lineHeight: 56 },
  hpMax: { fontFamily: fonts.display, fontSize: 22, color: colors.textSecondary },
  temp: { alignItems: 'center', backgroundColor: colors.infoBg, borderRadius: 14, padding: spacing.sm },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.surface2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  amount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: 14,
    minHeight: 44,
  },
  amountBtn: { width: 32, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  amountSign: { fontFamily: fonts.display, fontSize: 18, color: colors.textSecondary },
  amountInput: {
    width: 44,
    textAlign: 'center',
    color: colors.text,
    fontFamily: fonts.displayBold,
    fontSize: 18,
    padding: 0,
  },
  death: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  fill2: { flex: 1 },
  tempLabel: { fontSize: 12, color: colors.info },
  width72: { width: 72 },
});
