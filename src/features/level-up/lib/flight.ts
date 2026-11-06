// Перелёт кольца ритуала в значок шапки колоды: где и какого размера кольцо на доле пути p (0…1).

import { BADGE, RITUAL_RING } from '../config/constants';

const lerp = (from: number, to: number, p: number) => {
  'worklet';
  return from + (to - from) * p;
};

/** Рамка летящего кольца: центр — от кольца к значку, размер 212 → 36. */
export function flightFrame(
  p: number,
  from: { x: number; y: number },
  to: { x: number; y: number },
): { left: number; top: number; size: number } {
  'worklet';
  const size = lerp(RITUAL_RING.size, BADGE.size, p);
  return { left: lerp(from.x, to.x, p) - size / 2, top: lerp(from.y, to.y, p) - size / 2, size };
}
