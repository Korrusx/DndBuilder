import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface2,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: { color: colors.text, fontFamily: fonts.display, fontSize: 16 },
  epitaph: { color: colors.textTertiary, fontFamily: fonts.text, fontStyle: 'italic', fontSize: 15 },
});
