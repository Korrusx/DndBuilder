import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fill: { flex: 1 },
  textHeal: { color: colors.heal },
});
