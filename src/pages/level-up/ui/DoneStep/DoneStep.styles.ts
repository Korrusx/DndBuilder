import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  title: { textAlign: 'center', fontFamily: fonts.display, fontSize: 20, color: colors.text },
  chronicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.healBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chronicleText: { flex: 1, fontFamily: fonts.text, fontSize: 13, color: colors.heal },
  next: { borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 4 },
  nextCaption: { fontFamily: fonts.text, fontSize: 12, letterSpacing: 0.7, color: colors.textSecondary },
  nextText: { fontFamily: fonts.text, fontSize: 14, lineHeight: 20, color: colors.text },
});
