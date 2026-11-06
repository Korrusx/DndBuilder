import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

export const RING_SIZE = 184;
export const RING_RADIUS = 80;
export const RING_STROKE = 6;

export const styles = StyleSheet.create({
  ring: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', top: 12, right: 12, bottom: 12, left: 12, borderRadius: 80 },
  burst: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: RING_SIZE / 2, borderWidth: 2 },
  caption: {
    position: 'absolute',
    top: 40,
    fontFamily: fonts.text,
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#C9A46A',
  },
  digit: { position: 'absolute', fontFamily: fonts.displayBold, fontSize: 88, lineHeight: 104 },
});
