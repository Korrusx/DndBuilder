import { colors, fonts, radius, spacing } from '@/shared/config';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  line: { flexDirection: 'row', alignItems: 'center', minHeight: 36, gap: spacing.sm },
  num: { fontFamily: fonts.display, fontSize: 15, color: colors.text, textAlign: 'right' },
});
