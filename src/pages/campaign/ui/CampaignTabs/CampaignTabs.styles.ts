import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: {
    flexGrow: 1,
    minHeight: sizes.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  active: { borderBottomColor: colors.accent },
  label: { color: colors.textSecondary, fontFamily: fonts.textMedium, fontSize: 15 },
  activeLabel: { color: colors.accent },
});
