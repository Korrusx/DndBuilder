import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileIcon: { flexDirection: 'row', alignItems: 'center', gap: 6, overflow: 'hidden' },
  text: { flex: 1 },
  tileSelected: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  title: { fontFamily: fonts.textBold, fontSize: 14, color: colors.text },
  titleSelected: { color: colors.accent },
  subtitle: { fontSize: 12, lineHeight: 16 },
  tag: { fontFamily: fonts.textBold, fontSize: 10, lineHeight: 13, color: colors.heal },
});
