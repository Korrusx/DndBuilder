import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm },
  icon: { width: sizes.touchMin, height: sizes.touchMin, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1, paddingVertical: spacing.xs },
  title: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.text },
  subtitle: { fontFamily: fonts.text, fontSize: 13, color: colors.textSecondary },
  search: {
    flex: 1,
    minHeight: sizes.touchMin,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.text,
    fontSize: 16,
  },
});
