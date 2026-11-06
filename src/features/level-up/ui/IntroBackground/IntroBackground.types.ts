export type IntroBackgroundProps = {
  animate: boolean;
  /** Меняется вместе с кольцом — тёплая вспышка фона повторяется. */
  playKey: number;
  capstone?: boolean;
  /** Анимация пропущена до удара: тёплая вспышка сразу. */
  fromImpact?: boolean;
  /** Где по вертикали центр кольца (доля высоты экрана). */
  centerY?: number;
};
