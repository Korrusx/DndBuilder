import { StyleSheet } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  line: { flexDirection: 'row', alignItems: 'center', minHeight: 36, gap: spacing.sm },
  num: { fontFamily: fonts.display, fontSize: 15, color: colors.text, textAlign: 'right' },
  numW48: { width: 48 },
  numW80: { width: 80 },
  skillName: { flex: 1, color: colors.text },
  skillNameDim: { flex: 1, color: colors.textSecondary },
  padVXs: { paddingVertical: spacing.xs },
  groupTitle: { fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary },
  profMark: { width: 18, color: colors.accent },
  fill: { flex: 1 },
  statCell: { width: '31.5%', flex: 0 },
});
