import { StyleSheet } from 'react-native';

import { fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  small: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallLabel: { fontFamily: fonts.textBold, fontSize: 15 },
});
