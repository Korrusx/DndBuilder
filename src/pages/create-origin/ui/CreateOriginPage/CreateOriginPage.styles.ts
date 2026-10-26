import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  grid: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  fill: { flex: 1 },
  name: { fontFamily: fonts.display, fontSize: 15, color: colors.text },
  groupTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
});
