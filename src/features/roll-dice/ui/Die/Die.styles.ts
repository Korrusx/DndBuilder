import { colors, fonts } from '@/shared/config';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  die: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.accentBg,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dieDropped: { backgroundColor: colors.surface2, borderColor: colors.border },
  dieValue: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.accent },
  dieValueDropped: { color: colors.textSecondary, textDecorationLine: 'line-through' },
});
