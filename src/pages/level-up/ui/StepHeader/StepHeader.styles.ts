import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  button: { width: sizes.touchMin, height: sizes.touchMin, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  segment: { width: 28, height: 4, borderRadius: 2, backgroundColor: colors.border },
  segmentDone: { backgroundColor: colors.accent },
  caption: { flex: 1, textAlign: 'center', fontFamily: fonts.text, fontSize: 13, color: colors.textSecondary },
  spacer: { width: sizes.touchMin },
});
