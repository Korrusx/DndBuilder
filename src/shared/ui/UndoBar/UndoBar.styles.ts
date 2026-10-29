import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    minHeight: sizes.touchMin + 4,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
  },
  message: { flex: 1, color: colors.text, fontFamily: fonts.text, fontSize: 14 },
  action: { minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: spacing.lg },
  actionText: { color: colors.accent, fontFamily: fonts.textBold, fontSize: 14 },
});
