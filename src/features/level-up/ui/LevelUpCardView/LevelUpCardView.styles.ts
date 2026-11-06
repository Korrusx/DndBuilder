import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { DECK_UI } from '../../config/deckColors';

export const styles = StyleSheet.create({
  // --- Рубашка ---
  hidden: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  square: { width: 8, height: 8, borderRadius: 3 },
  lines: { flex: 1, minWidth: 0, gap: 2 },
  kicker: { fontFamily: fonts.text, fontSize: 11, letterSpacing: 0.66 },
  tapHint: { fontFamily: fonts.text, fontSize: 13, color: DECK_UI.secondary },
  needs: {
    height: 24,
    borderRadius: 12,
    backgroundColor: DECK_UI.accentPlate,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  needsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: DECK_UI.accent },
  needsText: { fontFamily: fonts.text, fontSize: 11, color: DECK_UI.accent },

  // --- Свёрнута ---
  collapsed: {
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  name: { fontFamily: fonts.textBold, fontSize: 15 },
  summary: { fontFamily: fonts.text, fontSize: 12 },

  // --- Развёрнута ---
  expanded: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  flash: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: DECK_UI.capstoneGlow,
    shadowColor: DECK_UI.capstoneGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 20 },
  headLabel: { flex: 1, fontFamily: fonts.text, fontSize: 11, letterSpacing: 0.66 },
  status: { fontFamily: fonts.text, fontSize: 11 },
  title: { fontFamily: fonts.display, fontSize: 19 },
  upgraded: { fontFamily: fonts.text, fontSize: 12 },
  strike: { textDecorationLine: 'line-through' },
  body: { fontFamily: fonts.text, fontSize: 14, lineHeight: 20, color: DECK_UI.body },
  more: { alignSelf: 'flex-start', fontFamily: fonts.text, fontSize: 13, color: DECK_UI.accent },
  hint: { fontFamily: fonts.text, fontSize: 12, color: DECK_UI.secondary },
  note: { fontFamily: fonts.text, fontSize: 12, color: DECK_UI.secondary },
  caption: { fontFamily: fonts.text, fontSize: 10, letterSpacing: 0.8 },
  section: { gap: 8 },
  line: { fontFamily: fonts.text, fontSize: 14, color: DECK_UI.body },

  // --- Чипы ---
  tag: { height: 26, borderRadius: 13, paddingHorizontal: 10, justifyContent: 'center' },
  tagText: { fontFamily: fonts.text, fontSize: 12 },
  picked: {
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickedText: { fontFamily: fonts.text, fontSize: 13 },
  change: { height: 32, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, justifyContent: 'center' },
  changeText: { fontFamily: fonts.text, fontSize: 12 },
  circle: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  circleText: { fontFamily: fonts.display, fontSize: 10 },
  always: { height: 30, borderRadius: 15, paddingHorizontal: 12, justifyContent: 'center' },

  // --- Кнопки выбора ---
  choose: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chooseText: { fontFamily: fonts.display, fontSize: 14, color: DECK_UI.onAccent },
  keep: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DECK_UI.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepText: { fontFamily: fonts.text, fontSize: 14, color: DECK_UI.soft },

  // --- Магия ---
  magic: { gap: 12 },
  divider: { height: 1, backgroundColor: DECK_UI.magicDivider },
  slotRow: { flexDirection: 'row', alignItems: 'center', minHeight: 24 },
  slotLabel: { width: 52, fontFamily: fonts.text, fontSize: 12, color: DECK_UI.secondary },
  slotLabelNew: { fontFamily: fonts.textBold, color: DECK_UI.magicNew },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  slotDot: { width: 16, height: 16, borderRadius: 8 },
  slotDotNew: {
    backgroundColor: DECK_UI.magicNew,
    shadowColor: '#C9A0FF',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  slotNote: { marginLeft: 12, fontFamily: fonts.text, fontSize: 12 },
  pact: { fontFamily: fonts.text, fontSize: 13, color: DECK_UI.body },
});
