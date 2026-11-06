import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { DECK_UI } from '../../config/deckColors';

export const styles = StyleSheet.create({
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 28, paddingHorizontal: 16, gap: 8 },
  button: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonOff: { backgroundColor: DECK_UI.surface, borderWidth: 1, borderColor: DECK_UI.border },
  buttonOn: { backgroundColor: DECK_UI.accent },
  buttonText: { fontFamily: fonts.display, fontSize: 15 },
  buttonTextOff: { color: DECK_UI.muted },
  buttonTextOn: { color: DECK_UI.onAccent },
  hint: { fontFamily: fonts.text, fontSize: 12, textAlign: 'center' },
});
