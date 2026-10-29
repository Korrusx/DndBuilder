import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.text,
    fontSize: 19,
    lineHeight: 28,
    textAlignVertical: 'top',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  mention: { color: colors.accent, backgroundColor: colors.accentBg },
});
