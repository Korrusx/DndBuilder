import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

export const CARD_MARGIN = 20;
export const CARD_MAX = 350;

export const styles = StyleSheet.create({
  root: { flex: 1 },
  // Сцена картинки «Поделиться» отрисована на экране, но под фоном — её не видно, а снять можно.
  shareLayer: { position: 'absolute', top: 0, left: 0 },
  safe: { flex: 1 },
  column: { flexGrow: 1, paddingTop: 18, paddingBottom: 18, paddingHorizontal: CARD_MARGIN, gap: 14 },
  head: { alignItems: 'center', gap: 2 },
  kicker: { fontFamily: fonts.text, fontSize: 12, letterSpacing: 12 * 0.18 },
  title: { fontFamily: fonts.display, fontSize: 20, textAlign: 'center' },
  spacer: { flexGrow: 1, minHeight: 8 },
  cardBox: { alignSelf: 'center' },
  bottom: { gap: 12 },
  buttons: { flexDirection: 'row', gap: 8 },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { fontFamily: fonts.display, fontSize: 14 },
  chronicle: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  chronicleText: { fontFamily: fonts.text, fontSize: 12 },
  error: { fontFamily: fonts.text, fontSize: 12, textAlign: 'center' },
});
