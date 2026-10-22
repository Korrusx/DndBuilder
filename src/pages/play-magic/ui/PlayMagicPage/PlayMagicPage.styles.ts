import { StyleSheet } from 'react-native';

import { colors, fonts, radius, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  spell: {
    gap: spacing.sm,
    minHeight: sizes.touchMin + 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.button,
    padding: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.sm },
  fillGap2: { flex: 1, gap: 2 },
  spellName: { fontFamily: fonts.textBold, flexShrink: 1 },
  size13: { fontSize: 13 },
  textAccent: { color: colors.accent },
});
