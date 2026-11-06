import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { STORY } from '../../config/shareScenes';

export const styles = StyleSheet.create({
  scene: { overflow: 'hidden' },
  spark: { position: 'absolute', transform: [{ rotate: '45deg' }] },
  post: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  story: {
    flex: 1,
    paddingTop: STORY.paddingTop,
    paddingHorizontal: STORY.paddingSide,
    paddingBottom: STORY.paddingBottom,
    gap: STORY.gap,
    alignItems: 'center',
  },
  watermark: {
    position: 'absolute',
    top: STORY.watermarkTop,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.displayBold,
    fontSize: STORY.watermarkSize,
    lineHeight: STORY.watermarkSize,
    includeFontPadding: false,
  },
  head: { alignItems: 'center', gap: 4 },
  kicker: { fontFamily: fonts.text, fontSize: 11, letterSpacing: 11 * 0.22 },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 22 * 1.25, textAlign: 'center' },
  spacer: { flex: 1 },
  foot: { alignItems: 'center', gap: 8 },
  campaign: { fontFamily: fonts.text, fontSize: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontFamily: fonts.display, fontSize: 14, letterSpacing: 14 * 0.06 },
});
