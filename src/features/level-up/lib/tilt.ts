// Наклон карты героя (hero-card-spec.md, раздел 6): отклонение телефона от исходного положения → поворот карты,
// положение блика и угол фольги.

export const TILT = {
  interval: 33,
  maxDeviation: 20,
  smoothing: 0.15,
  factor: 0.3,
  maxRotation: 6,
  restSheenOpacity: 0.6,
  /** Блик в покое: γ от −20° до +20° → сдвиг от −60 % до +160 % ширины полосы. */
  sheenShift: [-0.6, 1.6],
  frameSwing: 15,
} as const;

/** Сдвиг полосы блика в долях её ширины для шкалы sheenProgress 0…1 (−160 % … +260 %). */
const SHEEN_RANGE = [-1.6, 2.6] as const;

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

/** Отклонение от исходного положения в градусах, не больше ±20°. */
export function deviation(angleRad: number, baseRad: number): number {
  return clamp(((angleRad - baseRad) * 180) / Math.PI, TILT.maxDeviation);
}

/** Шаг сглаживания: current += (target − current) × 0,15. */
export function smooth(current: number, target: number): number {
  'worklet';
  return current + (target - current) * TILT.smoothing;
}

/** Поворот карты: rotateX = −β × 0,3, rotateY = γ × 0,3, каждый не больше ±6°. */
export function cardRotation(beta: number, gamma: number): { rotateX: number; rotateY: number } {
  'worklet';
  const limit = (value: number) => Math.max(-TILT.maxRotation, Math.min(TILT.maxRotation, value));
  return { rotateX: limit(-beta * TILT.factor), rotateY: limit(gamma * TILT.factor) };
}

/** Положение блика в покое по γ — в шкале sheenProgress карты. */
export function restSheenProgress(gamma: number): number {
  'worklet';
  const k = (gamma + TILT.maxDeviation) / (TILT.maxDeviation * 2);
  const shift = TILT.sheenShift[0] + (TILT.sheenShift[1] - TILT.sheenShift[0]) * k;
  return (shift - SHEEN_RANGE[0]) / (SHEEN_RANGE[1] - SHEEN_RANGE[0]);
}

/** Угол фольги вслед за γ: 150° ± 15°. */
export function frameAngleFor(base: number, gamma: number): number {
  'worklet';
  return base + (gamma / TILT.maxDeviation) * TILT.frameSwing;
}
