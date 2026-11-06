import { StyleSheet } from 'react-native';

import { colors, fonts, rarityColors } from '@/shared/config';

export const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  circle: { width: 56, fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
  circleNew: { color: '#E2D0FF', fontFamily: fonts.textBold },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: rarityColors['very rare'] },
  dotNew: {
    backgroundColor: '#E2D0FF',
    shadowColor: rarityColors['very rare'],
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  note: { fontFamily: fonts.text, fontSize: 12, color: rarityColors['very rare'] },
});
