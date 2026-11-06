import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { DECK_UI } from '../../config/deckColors';

export const styles = StyleSheet.create({
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  more: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DECK_UI.border,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { fontFamily: fonts.text, fontSize: 12 },
});
