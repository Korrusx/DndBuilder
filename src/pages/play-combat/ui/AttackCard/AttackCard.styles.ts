import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fill: { flex: 1 },
  toHit: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.accent },
});
