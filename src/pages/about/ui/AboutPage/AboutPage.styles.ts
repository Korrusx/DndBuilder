import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  // Оригинальный английский текст атрибуции: тот же размер, что у русского над ним, только вторичный цвет.
  original: {
    color: colors.textSecondary,
  },
  changelogEntry: {
    gap: spacing.xs,
  },
  changelogItem: {
    paddingLeft: spacing.sm,
  },
  build: {
    fontSize: 12,
    lineHeight: 16,
  },
});
