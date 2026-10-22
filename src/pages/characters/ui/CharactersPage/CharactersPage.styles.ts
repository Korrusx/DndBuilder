import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  fill: { flex: 1 },
  centered: { textAlign: 'center' },
  whatsNewBanner: {
    backgroundColor: colors.accentBg,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  whatsNewItem: {
    paddingLeft: spacing.sm,
  },
});
