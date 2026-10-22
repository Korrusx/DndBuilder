import { StyleSheet } from 'react-native';

import { colors, fonts } from '@/shared/config';

export const styles = StyleSheet.create({
  sm: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: { backgroundColor: colors.surface2 },
  letterSm: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.accent },
  letterLg: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.accent },
  letterDim: { color: colors.textSecondary },
});
