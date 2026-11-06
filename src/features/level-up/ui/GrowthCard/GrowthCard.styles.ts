import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { DECK_COLORS, DECK_UI } from '../../config/deckColors';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: DECK_COLORS.growth.bg,
    borderWidth: 1,
    borderColor: DECK_COLORS.growth.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  square: { width: 8, height: 8, borderRadius: 3, backgroundColor: DECK_COLORS.growth.accent },
  kicker: { flex: 1, fontFamily: fonts.text, fontSize: 11, letterSpacing: 0.66, color: DECK_COLORS.growth.accent },
  toggle: {
    alignSelf: 'flex-start',
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DECK_UI.border,
    backgroundColor: DECK_UI.surface2,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleText: { fontFamily: fonts.text, fontSize: 12, color: DECK_UI.soft },
  list: {
    borderRadius: 12,
    backgroundColor: DECK_UI.growthList,
    paddingTop: 6,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  group: {
    fontFamily: fonts.text,
    fontSize: 10,
    letterSpacing: 0.8,
    color: DECK_UI.muted,
    paddingTop: 8,
    paddingBottom: 2,
  },
});
