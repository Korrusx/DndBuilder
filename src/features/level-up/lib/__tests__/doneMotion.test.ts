import { CARD_POSE, doneInitial, neighborStyle, swipeStep } from '../doneMotion';

describe('экран итога', () => {
  test('уменьшение движения: сразу конечное состояние без блика и искр', () => {
    expect(doneInitial(false)).toEqual({
      card: CARD_POSE.rest,
      uiOpacity: 1,
      uiTranslateY: 0,
      sheenOpacity: 0,
      sparksVisible: false,
    });
    expect(doneInitial(true).card).toEqual(CARD_POSE.start);
  });

  test('смена стиля свайпом без зацикливания', () => {
    expect(neighborStyle('amber', 1)).toBe('night');
    expect(neighborStyle('night', 1)).toBe('parchment');
    expect(neighborStyle('parchment', 1)).toBeNull();
    expect(neighborStyle('amber', -1)).toBeNull();
    expect(swipeStep(-41, 0)).toBe(1);
    expect(swipeStep(45, 0)).toBe(-1);
    expect(swipeStep(-10, -0.6)).toBe(1);
    expect(swipeStep(-20, -0.1)).toBe(0);
  });
});
