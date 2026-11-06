import { RING_END, ringInitial, ringTimings, slotDelay } from '../motion';

describe('анимации повышения уровня', () => {
  test('уменьшение движения: кольцо сразу в конечном состоянии (новая цифра, полное кольцо)', () => {
    expect(ringInitial(false)).toEqual(RING_END);
    expect(ringInitial(false)).toMatchObject({ progress: 1, oldOpacity: 0, newOpacity: 1, newScale: 1 });
    expect(ringInitial(true).progress).toBe(0);
  });
  test('вершина на 30 % дольше; ячейки без анимации появляются сразу', () => {
    expect(ringTimings(true).fill).toBeCloseTo(ringTimings(false).fill * 1.3);
    expect(slotDelay(3, false)).toBe(0);
    expect(slotDelay(2, true)).toBe(300);
  });
});
