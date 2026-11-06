import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { DECK_UI } from '../../config/deckColors';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowList: { minHeight: 28 },
  label: { flex: 1, fontFamily: fonts.text, fontSize: 14, color: DECK_UI.text },
  labelList: { fontSize: 13, color: DECK_UI.soft },
  before: { fontFamily: fonts.displayRegular, fontSize: 12, color: DECK_UI.secondary },
  beforeList: { fontSize: 11, color: DECK_UI.muted },
  arrow: { fontFamily: fonts.text, fontSize: 14, color: DECK_UI.muted },
  arrowList: { fontSize: 12, color: DECK_UI.dot },
  after: { fontFamily: fonts.display, fontSize: 13, color: DECK_UI.text },
  afterList: { fontSize: 12, minWidth: 28, textAlign: 'right' },
});
