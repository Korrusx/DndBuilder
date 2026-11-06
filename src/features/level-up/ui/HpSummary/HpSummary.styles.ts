import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    backgroundColor: colors.healBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    gap: 10,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  breakdown: { flex: 1, fontFamily: fonts.text, fontSize: 14, lineHeight: 20, color: '#A8D9BC' },
  gain: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.heal },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  from: { fontFamily: fonts.display, fontSize: 15, color: '#A8D9BC' },
  to: { fontFamily: fonts.display, fontSize: 15, color: colors.heal },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#0E1D16', overflow: 'hidden', flexDirection: 'row' },
  old: { backgroundColor: '#4E9E73' },
  added: { backgroundColor: colors.heal },
});
