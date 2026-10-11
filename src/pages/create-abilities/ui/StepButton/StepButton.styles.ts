import { colors, fonts, sizes } from '@/shared/config';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  stepButton: {
    width: 32,
    height: sizes.touchMin,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontFamily: fonts.display, fontSize: 16, color: colors.text, textAlign: 'center' },
});
