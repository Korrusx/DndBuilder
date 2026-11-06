// Раскадровка анимаций повышения уровня (раздел 8): с чего начинается и чем кончается каждая анимация.
// Без анимаций (системное «уменьшение движения» или настройка) компоненты сразу берут конечные значения.

import { MOTION } from '../config/deck';

export type RingState = {
  /** Заполненность кольца 0…1. */
  progress: number;
  oldOpacity: number;
  oldScale: number;
  newOpacity: number;
  newScale: number;
  /** Вспышка-кольцо. */
  burstOpacity: number;
  burstScale: number;
  /** Подпись «<Имя> растёт» и рубашки. */
  hintOpacity: number;
};

export const RING_START: RingState = {
  progress: 0,
  oldOpacity: 1,
  oldScale: 1,
  newOpacity: 0,
  newScale: 1.7,
  burstOpacity: 0,
  burstScale: 0.85,
  hintOpacity: 0.35,
};

export const RING_END: RingState = {
  progress: 1,
  oldOpacity: 0,
  oldScale: 0.55,
  newOpacity: 1,
  newScale: 1,
  burstOpacity: 0,
  burstScale: 1.55,
  hintOpacity: 1,
};

/** С чего начинается кольцо: с анимацией — со старой цифры, без неё — сразу конечное состояние. */
export function ringInitial(animate: boolean): RingState {
  return animate ? RING_START : RING_END;
}

/** Длительности кольца; у вершины всё на 30 % дольше. */
export function ringTimings(capstone: boolean) {
  const k = capstone ? MOTION.capstoneSlowdown : 1;
  return {
    delay: MOTION.ringDelay * k,
    fill: MOTION.ringFill * k,
    swapAt: MOTION.digitSwap * k,
    digitIn: MOTION.digitIn * k,
    burst: MOTION.burst * k,
    jumpAt: MOTION.jumpStart * k,
  };
}

/** Поворот карты: рубашка 0°, лицо 180°. Без анимации открытая карта сразу лицом. */
export function flipInitial(revealed: boolean): number {
  return revealed ? 180 : 0;
}

/** Задержка появления i-го нового кружка ячейки; без анимации — все сразу. */
export function slotDelay(index: number, animate: boolean): number {
  return animate ? index * MOTION.slotStep : 0;
}
