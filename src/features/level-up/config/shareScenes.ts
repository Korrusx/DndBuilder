// Картинки «Поделиться»: базовые сцены в pt и размер снимка в px.

export type ShareKind = 'post' | 'story';

export const SHARE_SCENES = {
  post: { width: 390, height: 487.5, pixelWidth: 1080, pixelHeight: 1350, centerY: 0.45, positions: [0, 0.48, 0.8] },
  story: { width: 390, height: 693, pixelWidth: 1080, pixelHeight: 1920, centerY: 0.46, positions: [0, 0.45, 0.78] },
} as const;

/** Поля поста вокруг карты (сверху и снизу одинаковые). */
export const POST_MARGIN = 20;

/** Сторис: поля, ширина компактной карты, водяной знак уровня. */
export const STORY = {
  paddingTop: 34,
  paddingSide: 28,
  paddingBottom: 26,
  gap: 18,
  cardWidth: 300,
  watermarkSize: 420,
  watermarkTop: 40,
  watermarkOpacity: 0.8,
} as const;

/** Статичные искры сторис (x, y, размер, прозрачность) на сцене 390 × 693; в посте — те же, сжатые по высоте. */
export const STATIC_SPARKS = [
  { x: 40, y: 150, size: 8, opacity: 0.9 },
  { x: 330, y: 120, size: 6, opacity: 0.7 },
  { x: 352, y: 300, size: 9, opacity: 0.8 },
  { x: 26, y: 380, size: 5, opacity: 0.6 },
  { x: 300, y: 470, size: 6, opacity: 0.5 },
  { x: 70, y: 520, size: 7, opacity: 0.45 },
  { x: 200, y: 96, size: 5, opacity: 0.6 },
] as const;
