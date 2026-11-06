import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

/** Кольцо: область 184 × 184, радиус 80, линия 6 (раздел 8). */
export const RING_SIZE = 184;
export const RING_CENTER = 92;
export const RING_RADIUS = 80;
export const RING_STROKE = 6;
/** Свечение — круг диаметром 260 с центром в центре кольца. */
export const GLOW_SIZE = 260;
/** Вспышка — контур радиусом 92, линия 2. */
export const BURST_RADIUS = 92;

const glowOffset = (RING_SIZE - GLOW_SIZE) / 2;

export const styles = StyleSheet.create({
  ring: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  glow: { position: 'absolute', top: glowOffset, left: glowOffset, width: GLOW_SIZE, height: GLOW_SIZE },
  svg: { position: 'absolute', top: 0, left: 0 },
  burst: {
    position: 'absolute',
    top: RING_CENTER - BURST_RADIUS,
    left: RING_CENTER - BURST_RADIUS,
    width: BURST_RADIUS * 2,
    height: BURST_RADIUS * 2,
    borderRadius: BURST_RADIUS,
    borderWidth: 2,
  },
  caption: {
    position: 'absolute',
    top: 38,
    fontFamily: fonts.text,
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#C9A46A',
  },
  digit: { position: 'absolute', fontFamily: fonts.displayBold, fontSize: 88, lineHeight: 104, top: 50 },
});
