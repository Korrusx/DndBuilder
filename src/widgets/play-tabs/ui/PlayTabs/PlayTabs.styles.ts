import { StyleSheet } from 'react-native';

import { colors, fonts, sizes } from '@/shared/config';

export const styles = StyleSheet.create({
  headerButton: { minWidth: sizes.touchMin, minHeight: sizes.touchMin, justifyContent: 'center', alignItems: 'center' },
  headerRight: { flexDirection: 'row', marginRight: 8 },
  backButton: { minWidth: sizes.touchMin, minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: 16 },
  backArrow: { fontSize: 28, color: colors.text },
  textButton: { minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: 16 },
  linkLabel: { color: colors.accent, fontFamily: fonts.textBold },
});
