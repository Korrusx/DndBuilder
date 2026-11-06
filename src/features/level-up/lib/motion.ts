// Раскадровка анимаций повышения уровня (docs/features/level-up.md, раздел 8).
// Таймлайн У1 — в мс от открытия экрана; у вершины (20-й уровень) все длительности на 30 % больше.
// Без анимаций (системное «уменьшение движения» или настройка) компоненты сразу берут конечные значения.

import { MOTION } from '../config/deck';

/** Таймлайн У1 «Новый уровень», мс от открытия экрана. */
export const INTRO = {
  fillStart: 300,
  fillEnd: 1500,
  /** Искра гаснет после замыкания кольца. */
  sparkFade: 100,
  /** Старая цифра уходит 1500–1650. */
  oldOut: 150,
  /** Удар: вибрация «успех», звук, новая цифра, вспышка, пик свечения. */
  impact: 1550,
  /** Новая цифра: к 0,92 к 1750, opacity 1 к 1700, пружина до 1,0 к 1850. */
  newDip: 200,
  newFade: 150,
  /** Вспышка: пик к 1600, гаснет к 1950. */
  burstPeak: 50,
  burstEnd: 400,
  /** Свечение: пик к 1620, покой к 2200; фон теплеет к 1600 и остывает к 2200. */
  glowPeak: 70,
  settle: 2200,
  /** Заголовок проявляется 1700–2200. */
  hintStart: 1700,
  /** Рубашки: 1650 + i × 120, по 300 мс. */
  jumpStart: 1650,
  jumpStep: 120,
  jumpDuration: 300,
  /** Период мерцания свечения во время заполнения. */
  flickerPeriod: 600,
  /** Ритуал: нижний блок (строка и кнопки) проявляется 1700–2100. */
  actionsEnd: 2100,
  /** «Уменьшение движения»: звук с этого момента — удар звучит почти сразу. */
  reducedSound: 1450,
} as const;

/** Вибрации во время заполнения кольца — на этих долях прогресса. */
export const FILL_TICKS = [0.25, 0.5, 0.75] as const;

/** Свечение, ореол и пружина новой цифры (раздел 8). */
export const GLOW = {
  /** Мерцание во время заполнения: 0,15 + 0,35 × прогресс ± 0,12. */
  restOpacity: 0.15,
  /** В покое (до анимации и после неё) свечения нет. */
  idleOpacity: 0,
  /** За сколько мс свечение проявляется в начале заполнения (без скачка из нуля). */
  fadeIn: 150,
  restScale: 0.9,
  fillGain: 0.35,
  flicker: 0.12,
  peakOpacity: 0.9,
  peakScale: 1.15,
  endOpacity: 0,
  endScale: 1,
  haloBase: 0.6,
  haloSwing: 0.25,
  hintDim: 0.3,
  spring: { damping: 12, stiffness: 180 },
} as const;

/** Таймлайн с учётом вершины: все моменты и длительности × 1,3. */
export function introTimeline(capstone: boolean): Record<keyof typeof INTRO, number> {
  const k = capstone ? MOTION.capstoneSlowdown : 1;
  return Object.fromEntries(Object.entries(INTRO).map(([key, value]) => [key, value * k])) as Record<
    keyof typeof INTRO,
    number
  >;
}

/** Прозрачность свечения во время заполнения: растёт с прогрессом и «дышит» с периодом 600 мс. */
export function glowFlicker(progress: number, elapsedMs: number, period: number = INTRO.flickerPeriod): number {
  'worklet';
  const appear = Math.min(1, elapsedMs / GLOW.fadeIn);
  return (
    appear * (GLOW.restOpacity + GLOW.fillGain * progress + GLOW.flicker * Math.sin((2 * Math.PI * elapsedMs) / period))
  );
}

/** Прозрачность ореола искры: 0,6 ± 0,25 в той же фазе, что и свечение. */
export function haloPulse(elapsedMs: number, period: number = INTRO.flickerPeriod): number {
  'worklet';
  return GLOW.haloBase + GLOW.haloSwing * Math.sin((2 * Math.PI * elapsedMs) / period);
}

/** Где искра на кольце: θ = −90° + 360° × прогресс (от верхней точки по часовой стрелке). */
export function sparkPoint(progress: number, center: number, radius: number): { x: number; y: number } {
  'worklet';
  const theta = ((-90 + 360 * progress) * Math.PI) / 180;
  return { x: center + radius * Math.cos(theta), y: center + radius * Math.sin(theta) };
}

/** Поворот рубашки при прыжке: первая −3°, последняя +3°, остальные 0°. */
export function jumpRotation(index: number, count: number): number {
  if (count < 2) {
    return 0;
  }
  return index === 0 ? -3 : index === count - 1 ? 3 : 0;
}

/** Состояние кольца в покое до анимации и в конце. */
export type RingState = {
  progress: number;
  oldOpacity: number;
  oldScale: number;
  newOpacity: number;
  newScale: number;
  burstOpacity: number;
  burstScale: number;
  glowOpacity: number;
  glowScale: number;
  sparkOpacity: number;
  /** Заголовок и подзаголовок под кольцом. */
  hintOpacity: number;
  /** Тёплая вспышка фона (0 — обычный градиент). */
  warm: number;
};

export const RING_START: RingState = {
  progress: 0,
  oldOpacity: 1,
  oldScale: 1,
  newOpacity: 0,
  newScale: 1.7,
  burstOpacity: 0,
  burstScale: 0.85,
  glowOpacity: GLOW.idleOpacity,
  glowScale: GLOW.restScale,
  sparkOpacity: 0,
  hintOpacity: GLOW.hintDim,
  warm: 0,
};

export const RING_END: RingState = {
  progress: 1,
  oldOpacity: 0,
  oldScale: 0.55,
  newOpacity: 1,
  newScale: 1,
  burstOpacity: 0,
  burstScale: 1.55,
  glowOpacity: GLOW.endOpacity,
  glowScale: GLOW.endScale,
  sparkOpacity: 0,
  hintOpacity: 1,
  warm: 0,
};

/** С чего начинается кольцо: с анимацией — покой со старой цифрой, без неё — сразу конечное состояние. */
export function ringInitial(animate: boolean): RingState {
  return animate ? RING_START : RING_END;
}

/** Поворот карты: рубашка 0°, лицо 180°. Без анимации открытая карта сразу лицом. */
export function flipInitial(revealed: boolean): number {
  return revealed ? 180 : 0;
}

/** Задержка появления i-го нового кружка ячейки; без анимации — все сразу. */
export function slotDelay(index: number, animate: boolean): number {
  return animate ? index * MOTION.slotStep : 0;
}
