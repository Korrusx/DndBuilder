import { StyleSheet } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  grid: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  name: { fontFamily: fonts.display, fontSize: 16, color: colors.text },
  fill: { flex: 1 },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: { textAlign: 'center' },
});
