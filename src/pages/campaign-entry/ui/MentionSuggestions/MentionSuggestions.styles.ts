import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  panel: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  hit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchMin + 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.info,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: { color: colors.info, fontFamily: fonts.display, fontSize: 13 },
  hitInfo: { flex: 1, paddingVertical: spacing.sm },
  hitName: { color: colors.text, fontFamily: fonts.textBold, fontSize: 16 },
  hitMeta: { color: colors.textSecondary, fontFamily: fonts.text, fontSize: 13 },
  create: { padding: spacing.md, gap: spacing.sm },
  createTitle: { color: colors.textSecondary, fontFamily: fonts.text, fontSize: 14 },
  types: { flexDirection: 'row', gap: spacing.sm },
  type: {
    flex: 1,
    minHeight: sizes.touchMin,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: { color: colors.text, fontFamily: fonts.textMedium, fontSize: 14 },
});
