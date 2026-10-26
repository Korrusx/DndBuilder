import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.surface2,
  },
  pillAccent: { backgroundColor: colors.accentBg },
  label: { fontFamily: fonts.textMedium, fontSize: 13, color: colors.text },
  labelAccent: { color: colors.accent },
});
