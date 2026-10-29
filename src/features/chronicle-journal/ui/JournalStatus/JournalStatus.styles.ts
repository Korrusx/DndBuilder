import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: -spacing.xs },
  line: { fontFamily: fonts.text, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  live: { color: colors.heal },
  warn: { color: colors.damage },
});
