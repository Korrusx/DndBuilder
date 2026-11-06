export type RadialFillProps = {
  /** Уникальный id градиента в SVG. */
  id: string;
  /** Цвет в центре; дальше — mid и край фона ритуала. */
  center: string;
  width: number;
  height: number;
  /** Центр по вертикали (доля высоты). */
  centerY: number;
};
