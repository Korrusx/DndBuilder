// Раскадровка экрана итога, мс от открытия экрана.

import type { CardStyle } from '../config/heroCardThemes';
import { CARD_STYLES } from '../config/heroCardThemes';

export const DONE_TIMELINE = {
  cardRise: 850,
  cardLand: 560,
  sparks: [700, 950, 1200],
  sparkLife: 1400,
  sheenStart: 900,
  sheenDuration: 1400,
  uiStart: 1000,
  uiDuration: 600,
  flipHalf: 150,
  backgroundFade: 300,
} as const;

/** Карта до появления, на перелёте (~560 мс) и в покое. */
export const CARD_POSE: Record<'start' | 'overshoot' | 'rest', CardPose> = {
  start: { translateY: 60, scale: 0.9, rotate: -2, opacity: 0 },
  overshoot: { translateY: -6, scale: 1.02, rotate: 0.5, opacity: 1 },
  rest: { translateY: 0, scale: 1, rotate: 0, opacity: 1 },
};

/** Искры вокруг карты: позиция, размер, цвет (индекс в `spark` темы), ромб или квадрат. */
export const SPARKS = [
  { left: 14, top: 120, size: 10, color: 0, diamond: true },
  { right: 8, top: 70, size: 8, color: 1, diamond: false },
  { right: 24, top: 300, size: 6, color: 0, diamond: false },
] as const;

/** Свайп по карте: порог 40 pt или скорость 500 pt/с. */
export const SWIPE = { distance: 40, velocity: 0.5 } as const;

export type CardPose = { translateY: number; scale: number; rotate: number; opacity: number };

export type DoneState = {
  card: CardPose;
  uiOpacity: number;
  uiTranslateY: number;
  sheenOpacity: number;
  sparksVisible: boolean;
};

/** С чего начинается экран: с анимацией — карта ещё не выехала, без неё — всё на месте, без блика и искр. */
export function doneInitial(animate: boolean): DoneState {
  return animate
    ? { card: CARD_POSE.start, uiOpacity: 0, uiTranslateY: 12, sheenOpacity: 0, sparksVisible: true }
    : { card: CARD_POSE.rest, uiOpacity: 1, uiTranslateY: 0, sheenOpacity: 0, sparksVisible: false };
}

/** Соседний стиль без зацикливания: 1 — следующий (свайп влево), −1 — предыдущий. */
export function neighborStyle(style: CardStyle, step: 1 | -1): CardStyle | null {
  const next = CARD_STYLES.indexOf(style) + step;
  return next >= 0 && next < CARD_STYLES.length ? CARD_STYLES[next] : null;
}

/** Направление свайпа по сдвигу (pt) и скорости (pt/мс): 1 — влево (следующий стиль), −1 — вправо, 0 — нет. */
export function swipeStep(dx: number, vx: number): 1 | -1 | 0 {
  if (Math.abs(dx) >= SWIPE.distance || Math.abs(vx) >= SWIPE.velocity) {
    return dx < 0 ? 1 : dx > 0 ? -1 : 0;
  }
  return 0;
}
