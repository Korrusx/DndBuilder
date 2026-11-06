// Наклон карты героя: отклонение телефона от исходного положения → поворот карты,
// положение блика и угол фольги.

export const TILT = {
  interval: 16,
  /** Шаг сглаживания задан для 33 мс; на кадрах другой длины пересчитывается. */
  smoothingFrame: 33,
  maxDeviation: 20,
  smoothing: 0.15,
  factor: 0.5,
  maxRotation: 10,
  restSheenOpacity: 0.6,
  /** Наклон и блик в покое включаются плавно, мс. */
  fadeIn: 300,
  /** Блик в покое: γ от −20° до +20° → сдвиг от −60 % до +160 % ширины полосы. */
  sheenShift: [-0.6, 1.6],
  frameSwing: 15,
} as const;

/** Сдвиг полосы блика в долях её ширины для шкалы sheenProgress 0…1 (−160 % … +260 %). */
const SHEEN_RANGE = [-1.6, 2.6] as const;

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

export type Vec3 = { x: number; y: number; z: number };

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const scaled = (a: Vec3, k: number): Vec3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const minus = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });

/** Вектор единичной длины; нулевой — null. */
export function unit(v: Vec3): Vec3 | null {
  const length = Math.sqrt(dot(v, v));
  return length > 1e-6 ? scaled(v, 1 / length) : null;
}

/**
 * Наклон телефона от исходного положения по вектору силы тяжести (ускорение с учётом гравитации),
 * в градусах, не больше ±20°: γ — влево-вправо, β — на себя / от себя. В отличие от углов ориентации,
 * работает в любом положении телефона, в том числе когда его держат вертикально.
 */
export function gravityTilt(now: Vec3, base: Vec3): { beta: number; gamma: number } {
  const n = unit(now);
  const n0 = unit(base);
  if (!n || !n0) {
    return { beta: 0, gamma: 0 };
  }
  // Ось «влево-вправо» — ось X телефона, перпендикулярная исходному «верху»; если телефон лежит на боку — ось Y.
  const axis = Math.abs(n0.x) < 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
  const side = unit(minus(axis, scaled(n0, dot(axis, n0))))!;
  const forward = cross(n0, side);
  const degrees = (value: number) => (Math.asin(Math.max(-1, Math.min(1, value))) * 180) / Math.PI;
  return {
    beta: clamp(degrees(dot(n, forward)), TILT.maxDeviation),
    gamma: clamp(0 - degrees(dot(n, side)), TILT.maxDeviation),
  };
}

/** Доля пути за кадр длиной `dtMs`, чтобы за 33 мс получалось ровно 0,15 — плавно на любой частоте кадров. */
export function frameSmoothing(dtMs: number): number {
  'worklet';
  return 1 - Math.pow(1 - TILT.smoothing, Math.max(0, dtMs) / TILT.smoothingFrame);
}

/** Шаг сглаживания: current += (target − current) × 0,15. */
export function smooth(current: number, target: number): number {
  'worklet';
  return current + (target - current) * TILT.smoothing;
}

/** Поворот карты: rotateX = −β × 0,5, rotateY = γ × 0,5, каждый не больше ±10°. */
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
