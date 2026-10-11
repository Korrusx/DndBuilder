import { colors, fonts, spacing } from '@/shared/config';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  name: { fontFamily: fonts.display, fontSize: 16, color: colors.text },
});
