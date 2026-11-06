import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  small: { borderRadius: 8, borderWidth: 1, padding: 3, gap: 0 },
  wide: { alignItems: 'flex-start', padding: spacing.md, gap: 6 },
  current: { borderWidth: 2, transform: [{ translateY: -4 }] },
  dot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  label: { fontFamily: fonts.text, fontSize: 12, textAlign: 'center' },
  smallLabel: { fontFamily: fonts.text, fontSize: 10, lineHeight: 12, textAlign: 'center' },
  wideLabel: { fontFamily: fonts.textBold, fontSize: 15, color: colors.text, textAlign: 'left' },
  note: { fontFamily: fonts.text, fontSize: 12 },
  sub: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
});
