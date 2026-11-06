import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

/** Кольцо ритуала: область 212 × 212, радиус 92, линия 7. */
export const RING_SIZE = 212;
export const RING_CENTER = 106;
export const RING_RADIUS = 92;
export const RING_STROKE = 7;
/** Свечение — круг 320 × 320 с центром в центре кольца. */
export const GLOW_SIZE = 320;
/** Вспышка — контур радиусом 106, линия 2. */
export const BURST_RADIUS = 106;
/** Цифры: Unbounded 700, 100. */
const DIGIT_SIZE = 100;
const DIGIT_LINE = 120;

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
    top: 46,
    fontFamily: fonts.text,
    fontSize: 12,
    letterSpacing: 1.68,
    color: '#C9A46A',
  },
  digit: {
    position: 'absolute',
    fontFamily: fonts.displayBold,
    fontSize: DIGIT_SIZE,
    lineHeight: DIGIT_LINE,
    top: (RING_SIZE - DIGIT_LINE) / 2 + 8,
  },
});
