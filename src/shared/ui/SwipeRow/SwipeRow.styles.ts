import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  behind: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.damageBg,
    borderRadius: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  label: { color: colors.damage, fontFamily: fonts.textMedium, fontSize: 13 },
  front: { backgroundColor: colors.bg },
});
