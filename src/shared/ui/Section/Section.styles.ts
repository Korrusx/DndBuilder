import { StyleSheet } from 'react-native';

import { fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  counter: { fontFamily: fonts.display, fontSize: 14 },
  fill: { flex: 1 },
});
