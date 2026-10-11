import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  stat: {
    width: '31.5%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.text },
  label: { fontSize: 12, textAlign: 'center' },
  note: { fontSize: 11, textAlign: 'center' },
});
