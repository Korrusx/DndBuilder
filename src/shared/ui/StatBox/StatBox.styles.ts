import { colors, fonts, spacing } from '@/shared/config';
import { StyleSheet } from 'react-native';

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
  },
  statValue: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.text },
  statLabel: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
});
