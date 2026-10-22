import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  counter: { fontFamily: fonts.display, fontSize: 14, color: colors.accent },
  counterDone: { color: colors.heal },
  fill: { flex: 1 },
});
