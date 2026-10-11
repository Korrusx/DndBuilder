import { colors, radius, sizes, spacing } from '@/shared/config';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  spell: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
