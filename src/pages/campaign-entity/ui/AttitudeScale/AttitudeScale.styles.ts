import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.textSecondary, fontFamily: fonts.textMedium, fontSize: 12, letterSpacing: 1 },
  current: { fontFamily: fonts.textMedium, fontSize: 14 },
  row: { flexDirection: 'row', gap: 6 },
  hit: { flex: 1, height: sizes.touchMin - 8, justifyContent: 'center' },
  segment: { height: 12, borderRadius: 6, backgroundColor: colors.surface2 },
  ends: { flexDirection: 'row', justifyContent: 'space-between' },
  end: { color: colors.textSecondary, fontFamily: fonts.text, fontSize: 12 },
});
