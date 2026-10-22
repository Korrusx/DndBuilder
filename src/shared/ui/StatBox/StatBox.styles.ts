import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  stat: {
    flex: 1,
    minHeight: 72,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
  },
  statValue: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.text },
  statValueAccent: { color: colors.accent },
  statLabel: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
});
