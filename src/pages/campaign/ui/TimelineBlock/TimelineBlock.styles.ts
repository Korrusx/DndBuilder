import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  block: { gap: spacing.xs },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    minHeight: sizes.touchMin,
    paddingTop: spacing.sm,
  },
  title: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.text },
  date: { flex: 1, fontFamily: fonts.text, fontSize: 13, color: colors.textSecondary },
  live: { fontFamily: fonts.textMedium, fontSize: 13, color: colors.heal },
  end: { fontFamily: fonts.textBold, fontSize: 13, color: colors.accent, paddingVertical: spacing.xs },
  items: { position: 'relative' },
  line: { position: 'absolute', left: 13, top: 8, bottom: 8, width: 2, backgroundColor: colors.border },
  collapsed: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  collapsedHeader: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  stopped: {
    backgroundColor: colors.accentBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5A4520',
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  stoppedLabel: { color: colors.accent, fontFamily: fonts.textMedium, fontSize: 12, letterSpacing: 1 },
  stoppedText: { color: colors.text, fontFamily: fonts.text, fontStyle: 'italic', fontSize: 16, lineHeight: 23 },
  stoppedLine: { color: colors.accent, fontFamily: fonts.text, fontStyle: 'italic', fontSize: 13 },
  empty: { color: colors.textSecondary, fontFamily: fonts.text, fontSize: 14, paddingLeft: spacing.xl + 4 },
});
