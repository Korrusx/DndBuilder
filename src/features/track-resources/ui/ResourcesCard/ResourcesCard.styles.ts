import { colors, fonts, spacing } from '@/shared/config';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  item: { gap: spacing.xs },
  note: { fontSize: 13 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  left: { flex: 1, fontFamily: fonts.displayBold, fontSize: 22, color: colors.accent },
});
