import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  text: { textAlign: 'center' },
});
