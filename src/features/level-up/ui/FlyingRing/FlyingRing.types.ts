/** Точка на экране (координаты окна). */
export type ScreenPoint = { x: number; y: number };

export type FlyingRingProps = {
  /** Центр кольца ритуала. */
  from: ScreenPoint;
  /** Центр значка уровня в шапке колоды. */
  to: ScreenPoint;
  level: number;
  capstone?: boolean;
  /** Кольцо на месте значка: значок можно показать, слой убрать. */
  onDone: () => void;
};
