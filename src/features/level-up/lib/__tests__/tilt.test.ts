import { cardRotation, deviation, frameAngleFor, restSheenProgress, smooth, TILT } from '../tilt';

const rad = (deg: number) => (deg * Math.PI) / 180;

describe('наклон карты', () => {
  test('отклонение от исходного положения, не больше ±20°', () => {
    expect(deviation(rad(30), rad(20))).toBeCloseTo(10);
    expect(deviation(rad(60), 0)).toBe(20);
    expect(deviation(rad(-60), 0)).toBe(-20);
  });

  test('сглаживание: 15 % пути за шаг', () => {
    expect(smooth(0, 10)).toBeCloseTo(1.5);
    expect(smooth(1.5, 10)).toBeCloseTo(2.775);
  });

  test('поворот карты: β и γ × 0,3, не больше ±6°', () => {
    expect(cardRotation(10, -10)).toEqual({ rotateX: -3, rotateY: -3 });
    expect(cardRotation(-20, 20)).toEqual({ rotateX: 6, rotateY: 6 });
    expect(cardRotation(40, 0).rotateX).toBe(-TILT.maxRotation);
  });

  test('блик в покое: γ −20…+20 → сдвиг −60 %…+160 % ширины полосы', () => {
    const shift = (gamma: number) => -1.6 + 4.2 * restSheenProgress(gamma);
    expect(shift(-20)).toBeCloseTo(-0.6);
    expect(shift(20)).toBeCloseTo(1.6);
    expect(shift(0)).toBeCloseTo(0.5);
  });

  test('угол фольги 150° ± 15°', () => {
    expect(frameAngleFor(150, 20)).toBe(165);
    expect(frameAngleFor(150, -20)).toBe(135);
  });
});
