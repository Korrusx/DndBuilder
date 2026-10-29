import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  title: { color: colors.textSecondary, fontFamily: fonts.textMedium, fontSize: 12, letterSpacing: 1 },
  giver: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  giverText: { color: colors.accent, fontFamily: fonts.textMedium, fontSize: 15 },
  placeholder: { color: colors.textSecondary },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: sizes.touchMin },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepText: { flex: 1, color: colors.text, fontFamily: fonts.text, fontSize: 15 },
  stepDone: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  remove: { width: sizes.touchMin, height: sizes.touchMin, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grow: { flex: 1 },
});
