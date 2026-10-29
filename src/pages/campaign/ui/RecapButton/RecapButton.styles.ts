import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  button: {
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  text: { flex: 1 },
  title: { color: colors.onAccent, fontFamily: fonts.displayBold, fontSize: 17 },
  hint: { color: colors.onAccent, fontFamily: fonts.text, fontSize: 13, opacity: 0.8 },
});
