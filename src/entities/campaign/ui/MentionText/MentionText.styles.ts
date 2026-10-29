import { StyleSheet } from 'react-native';

import { colors, fonts } from '@/shared/config';

export const styles = StyleSheet.create({
  text: { fontFamily: fonts.text, fontSize: 16, lineHeight: 23, color: colors.text },
  mention: { color: colors.accent, backgroundColor: colors.accentBg, fontFamily: fonts.textMedium },
  missing: { color: colors.textSecondary, backgroundColor: 'transparent' },
});
