import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  difficulty: { alignItems: 'flex-end', gap: 4 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: colors.accent },
  dotFilled: { backgroundColor: colors.accent },
  difficultyLabel: { fontSize: 11 },
  pitch: { color: colors.textTertiary },
  nextRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'baseline' },
  nextLevel: { fontFamily: fonts.textBold, fontSize: 13, color: colors.accent, minWidth: 44 },
  nextText: { flex: 1 },
  subclassTag: { fontFamily: fonts.textBold, color: colors.info },
});
