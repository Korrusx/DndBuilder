import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  chip: {
    minHeight: sizes.touchMin,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface2,
  },
  chipProficient: { backgroundColor: colors.accentBg },
  text: { fontFamily: fonts.textMedium, fontSize: 14, color: colors.text },
  textProficient: { color: colors.accent },
});
