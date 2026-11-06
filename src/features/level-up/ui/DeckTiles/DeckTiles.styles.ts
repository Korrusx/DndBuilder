import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { DECK_UI } from '../../config/deckColors';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  scroll: { gap: 6 },
  tile: {
    aspectRatio: 1 / 1.05,
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    overflow: 'hidden',
  },
  tileCurrent: { borderWidth: 2 },
  mark: { fontFamily: fonts.display, fontSize: 12 },
  label: { fontFamily: fonts.text, fontSize: 10, lineHeight: 11.5, textAlign: 'center' },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: DECK_UI.accent,
  },
});
