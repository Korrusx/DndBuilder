import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { DECK_COLORS } from '../../config/deckColors';

/** Цвета карты хитов (шаг 3 нового потока). */
export const HP_CARD = {
  accent: DECK_COLORS.hp.accent,
  light: '#A8EBC4',
  dim: DECK_COLORS.hp.dim,
  deep: '#3C7F5B',
  text: '#A8D9BC',
  onAccent: '#0B1F14',
  border: DECK_COLORS.hp.border,
} as const;

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: DECK_COLORS.hp.bg,
    borderWidth: 1.5,
    borderColor: HP_CARD.accent,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 20 },
  square: { width: 8, height: 8, borderRadius: 3, backgroundColor: HP_CARD.accent },
  kicker: { flex: 1, fontFamily: fonts.text, fontSize: 11, letterSpacing: 0.66, color: HP_CARD.accent },
  first: { fontFamily: fonts.text, fontSize: 11, color: HP_CARD.dim },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  lines: { flex: 1, minWidth: 0, gap: 4 },
  formula: { fontFamily: fonts.display, fontSize: 18, color: '#F1ECE2' },
  explain: { fontFamily: fonts.text, fontSize: 13, lineHeight: 18, color: HP_CARD.text },
  roll: {
    height: 56,
    borderRadius: 16,
    backgroundColor: HP_CARD.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rollText: { fontFamily: fonts.display, fontSize: 15, color: HP_CARD.onAccent },
  grid: { flexDirection: 'row', gap: 8 },
  small: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HP_CARD.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  smallText: { fontFamily: fonts.text, fontSize: 13, color: HP_CARD.text, textAlign: 'center' },
  shake: { fontFamily: fonts.text, fontSize: 12, color: HP_CARD.dim, textAlign: 'center' },
  die: { alignItems: 'center', justifyContent: 'center' },
  dieText: { position: 'absolute', fontFamily: fonts.display, fontSize: 16, color: HP_CARD.onAccent },
});
