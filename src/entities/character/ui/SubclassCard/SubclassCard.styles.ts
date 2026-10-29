import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  pitch: { color: colors.textTertiary },
  nextRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'baseline' },
  nextLevel: { fontFamily: fonts.textBold, fontSize: 13, color: colors.accent, minWidth: 44 },
  nextText: { flex: 1 },
});
