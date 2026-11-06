import { StyleSheet } from 'react-native';

import { colors, radius, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchMin,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentBg,
  },
  text: { flex: 1, color: colors.text },
  action: { color: colors.accent },
});
