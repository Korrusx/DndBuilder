import { cardRotation, frameAngleFor, frameSmoothing, gravityTilt, restSheenProgress, smooth, TILT } from '../tilt';

const rad = (deg: number) => (deg * Math.PI) / 180;
/** «Верх» телефона, держат вертикально, наклонён на `pitch` к себе/от себя и на `roll` влево-вправо. */
const up = (pitch: number, roll: number) => ({
  x: -Math.sin(rad(roll)),
  y: Math.cos(rad(pitch)) * Math.cos(rad(roll)),
  z: Math.sin(rad(pitch)) * Math.cos(rad(roll)),
});

describe('наклон карты', () => {
  test('наклон по силе тяжести: оба направления, когда телефон держат вертикально', () => {
    const base = up(0, 0);
    expect(gravityTilt(up(0, 10), base).gamma).toBeCloseTo(10);
    expect(gravityTilt(up(0, -10), base).gamma).toBeCloseTo(-10);
    expect(Math.abs(gravityTilt(up(10, 0), base).beta)).toBeCloseTo(10);
    expect(gravityTilt(up(10, 0), base).gamma).toBeCloseTo(0);
    expect(gravityTilt(up(0, 60), base).gamma).toBe(20);
  });

  test('наклон по силе тяжести работает и когда телефон лежит на столе', () => {
    const flat = { x: 0, y: 0, z: 1 };
    const tilted = { x: -Math.sin(rad(8)), y: 0, z: Math.cos(rad(8)) };
    expect(gravityTilt(tilted, flat).gamma).toBeCloseTo(8);
    expect(gravityTilt(flat, flat)).toEqual({ beta: 0, gamma: 0 });
  });

  test('сглаживание по кадрам: за 33 мс — 15 %, за два кадра по 16,5 мс — столько же', () => {
    expect(frameSmoothing(33)).toBeCloseTo(0.15);
    const half = frameSmoothing(16.5);
    expect(1 - (1 - half) * (1 - half)).toBeCloseTo(0.15);
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
