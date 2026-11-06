import { StyleSheet } from 'react-native';

import { colors, fonts } from '@/shared/config';

export const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C4A38',
    backgroundColor: '#13261D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontFamily: fonts.display, fontSize: 18, color: colors.heal },
});
