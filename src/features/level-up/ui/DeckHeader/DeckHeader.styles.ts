import { StyleSheet } from 'react-native';

import { fonts, sizes } from '@/shared/config';

import { DECK_UI } from '../../config/deckColors';

export const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    paddingRight: 12,
    paddingBottom: 4,
    paddingLeft: 8,
  },
  back: { width: sizes.touchMin, height: sizes.touchMin, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1, minWidth: 0, gap: 1 },
  title: { fontFamily: fonts.display, fontSize: 16, color: DECK_UI.text },
  subtitle: { fontFamily: fonts.text, fontSize: 12, color: DECK_UI.secondary },
  revealAll: { height: sizes.touchMin, paddingHorizontal: 10, justifyContent: 'center' },
  revealAllText: { fontFamily: fonts.textBold, fontSize: 14, color: DECK_UI.accent },
  block: { paddingTop: 6, paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
  counter: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 },
  counterText: { fontFamily: fonts.text, fontSize: 13, color: DECK_UI.text },
  counterNumber: { fontFamily: fonts.display, fontSize: 12, color: DECK_UI.text },
  dot: { fontFamily: fonts.text, fontSize: 13, color: DECK_UI.dot },
  choices: { fontFamily: fonts.text, fontSize: 13, color: DECK_UI.accent },
  done: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'center' },
  doneText: { fontFamily: fonts.text, fontSize: 13, color: DECK_UI.heal },
});
