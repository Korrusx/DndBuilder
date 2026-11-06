export type RadialFillProps = {
  /** Уникальный id градиента в SVG. */
  id: string;
  /** Цвет в центре; к 60 % радиуса — цвет фона. */
  center: string;
  width: number;
  height: number;
  /** Центр по вертикали (доля высоты). */
  centerY: number;
};
