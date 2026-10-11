import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  hint: { backgroundColor: colors.accentBg, borderRadius: 16, padding: spacing.md },
  hintText: { color: colors.accent, fontSize: 14, lineHeight: 20 },
});
