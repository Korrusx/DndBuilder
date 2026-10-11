import { StyleSheet } from 'react-native';

import { colors, fonts } from '@/shared/config';

export const styles = StyleSheet.create({
  badge: { backgroundColor: colors.infoBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  badgeLabel: { fontFamily: fonts.textBold, fontSize: 11, color: colors.info },
});
