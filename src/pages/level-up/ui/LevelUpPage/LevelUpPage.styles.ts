import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  link: { alignSelf: 'center', minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: spacing.lg },
  linkText: { fontFamily: fonts.textBold, fontSize: 14, color: colors.textSecondary },
  error: { fontFamily: fonts.text, fontSize: 13, color: colors.damage, textAlign: 'center' },
});
