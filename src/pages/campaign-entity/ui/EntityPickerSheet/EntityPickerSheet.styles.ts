import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: {
    minHeight: sizes.touchMin + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface2,
  },
  picked: { borderWidth: 1, borderColor: colors.accent },
  name: { flex: 1, color: colors.text, fontFamily: fonts.textMedium, fontSize: 15 },
});
