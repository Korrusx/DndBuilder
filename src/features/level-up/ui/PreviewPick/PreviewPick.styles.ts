import { StyleSheet } from 'react-native';

import { colors, fonts } from '@/shared/config';

export const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    minHeight: 60,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  rowOn: { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: colors.accentBg },
  rowOff: { opacity: 0.7 },
  tick: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.iconMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOn: { borderWidth: 0, backgroundColor: colors.accent },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.textBold, fontSize: 15, color: colors.text },
  hint: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
  before: { fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary },
  arrow: { color: '#6B737D' },
  after: { fontFamily: fonts.display, fontSize: 15, minWidth: 36, textAlign: 'right', color: colors.textSecondary },
  afterOn: { color: colors.accent },
});
