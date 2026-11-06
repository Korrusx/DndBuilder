// Геометрия декоративных слоёв карты: как перевести CSS-градиенты макета в координаты Skia.

/** Точки линейного градиента под углом CSS (0° — вверх, по часовой) для прямоугольника w × h. */
export function linearPoints(angleDeg: number, width: number, height: number) {
  'worklet';
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const half = (Math.abs(width * dx) + Math.abs(height * dy)) / 2;
  const cx = width / 2;
  const cy = height / 2;
  return { start: { x: cx - dx * half, y: cy - dy * half }, end: { x: cx + dx * half, y: cy + dy * half } };
}

/** Радиус CSS radial-gradient «circle at x y» по умолчанию — до самого дальнего угла. */
export function farthestCorner(cx: number, cy: number, width: number, height: number): number {
  return Math.max(
    Math.hypot(cx, cy),
    Math.hypot(width - cx, cy),
    Math.hypot(cx, height - cy),
    Math.hypot(width - cx, height - cy),
  );
}

/** «r,g,b» и прозрачность → цвет. */
export const rgba = (rgb: string, alpha: number) => `rgba(${rgb},${alpha})`;
