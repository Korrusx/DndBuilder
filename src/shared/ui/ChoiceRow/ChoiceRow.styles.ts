import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.buttonPrimary,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
  },
  rowSelected: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: { flex: 1, gap: 2 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  title: { flexShrink: 1, fontFamily: fonts.textMedium, fontSize: 15, color: colors.text },
  titleSelected: { color: colors.accent },
  tag: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
  },
  tagLabel: { fontFamily: fonts.textBold, fontSize: 10, color: colors.textSecondary },
  summary: { fontFamily: fonts.text, fontSize: 13, color: colors.textSecondary },
  chevron: { fontFamily: fonts.text, fontSize: 22, color: colors.textSecondary },
  check: {
    width: sizes.buttonPrimary,
    minHeight: sizes.buttonPrimary,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
  checkMark: { fontFamily: fonts.textBold, fontSize: 14, lineHeight: 16, color: colors.onAccent },
  dimmed: { opacity: 0.4 },
});
