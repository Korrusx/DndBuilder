import { colors, spacing } from '@/shared/config/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
