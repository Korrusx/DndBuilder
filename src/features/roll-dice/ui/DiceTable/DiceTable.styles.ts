import { StyleSheet } from 'react-native';

import { colors, radius } from '@/shared/config';

import { DICE_TABLE_HEIGHT } from '../../config/diceSettings';

export const styles = StyleSheet.create({
  table: {
    height: DICE_TABLE_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  web: { flex: 1, backgroundColor: colors.surface },
});
