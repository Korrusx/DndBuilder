// Перелёт кольца ритуала в значок шапки колоды.

import { BADGE, RITUAL_RING } from '../../config/constants';
import { flightFrame } from '../flight';

describe('перелёт кольца', () => {
  // Положения — как их дают измерения measureInWindow: кольцо в центре ритуала, значок в шапке.
  type Rect = { x: number; y: number; width: number; height: number };
  const ring: Rect = { x: 200, y: 300, width: RITUAL_RING.size, height: RITUAL_RING.size };
  const badge: Rect = { x: 62, y: 58, width: BADGE.size, height: BADGE.size };
  const center = (rect: Rect) => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });

  test('в начале кольцо на своём месте, в конце — ровно на месте значка', () => {
    expect(flightFrame(0, center(ring), center(badge))).toEqual({ left: ring.x, top: ring.y, size: ring.width });
    expect(flightFrame(1, center(ring), center(badge))).toEqual({ left: badge.x, top: badge.y, size: badge.width });
  });

  test('в середине пути — между ними', () => {
    const mid = flightFrame(0.5, center(ring), center(badge));
    expect(mid.size).toBe((RITUAL_RING.size + BADGE.size) / 2);
  });
});
