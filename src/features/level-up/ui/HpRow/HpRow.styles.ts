import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { DECK_COLORS, DECK_UI } from '../../config/deckColors';

export const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: DECK_COLORS.hp.bg,
    borderWidth: 1,
    borderColor: DECK_COLORS.hp.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { flex: 1, fontFamily: fonts.textBold, fontSize: 15, color: DECK_UI.text },
  numbers: { fontFamily: fonts.displayRegular, fontSize: 13, color: DECK_UI.hpNumbers },
  gain: { fontFamily: fonts.displayRegular, fontSize: 13, color: DECK_UI.heal },
  roll: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DECK_COLORS.hp.border,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollText: { fontFamily: fonts.textBold, fontSize: 13, color: DECK_UI.heal },
});
