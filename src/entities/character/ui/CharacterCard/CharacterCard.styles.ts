import { StyleSheet } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardSelected: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  checkMark: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.onAccent },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flexShrink: 1 },
  level: { alignItems: 'center', minWidth: 40 },
  levelNumber: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.text },
  levelLabel: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
  hpBlock: { flex: 1, gap: spacing.xs },
  ac: {
    alignItems: 'center',
    minWidth: 52,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.surface2,
  },
  acNumber: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.text },
  draftRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  textInfo: { color: colors.info },
  fill: { flex: 1 },
});
