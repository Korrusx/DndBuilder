import { colors, fonts, spacing } from '@/shared/config/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  big: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.accent },
});
