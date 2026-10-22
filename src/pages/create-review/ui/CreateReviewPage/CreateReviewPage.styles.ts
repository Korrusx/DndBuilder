import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: spacing.sm },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nameInput: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 18,
  },
  issue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.damageBg,
    borderRadius: 14,
    paddingLeft: spacing.md,
    minHeight: sizes.touchMin,
  },
  issueInfo: { backgroundColor: colors.infoBg },
  issueText: { flex: 1, fontSize: 14, color: colors.damage },
  issueTextInfo: { flex: 1, fontSize: 14, color: colors.info },
  fix: { minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: spacing.md },
  fill: { flex: 1 },
  fill2: { flex: 2 },
  heroText: { flex: 1, gap: spacing.xs },
  gapSm: { gap: spacing.sm },
  linkLabel: { color: colors.accent, fontFamily: fonts.textBold },
});
