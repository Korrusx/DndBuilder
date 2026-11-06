import { StyleSheet } from 'react-native';

import { colors, fonts, rarityColors, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: 4 },
  title: { fontFamily: fonts.display, fontSize: 20, color: colors.text, textAlign: 'center' },
  sub: { fontFamily: fonts.text, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  stripCaption: { fontFamily: fonts.text, fontSize: 12, letterSpacing: 0.7, color: colors.textSecondary },
  pager: { flexGrow: 0 },
  page: { paddingHorizontal: 2 },
  back: { minHeight: 220 },
  revealAll: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.lg },
  revealAllText: { fontFamily: fonts.textBold, fontSize: 14, color: colors.accent },
  hint: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  hintText: { flex: 1, fontFamily: fonts.text, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  hintIcon: { color: rarityColors.rare },
  unchanged: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  unchangedCaption: { fontFamily: fonts.text, fontSize: 12, letterSpacing: 0.7, color: colors.textSecondary },
  unchangedText: { fontFamily: fonts.text, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
});
