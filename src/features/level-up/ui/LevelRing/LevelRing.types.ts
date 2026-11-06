export type LevelRingProps = {
  from: number;
  to: number;
  /** Играть анимацию (нет — сразу конечное состояние). */
  animate: boolean;
  /** 20-й уровень: оранжевое кольцо, всё на 30 % дольше. */
  capstone?: boolean;
  /** Меняется — анимация играет заново (повтор по нажатию). */
  playKey: number;
  onPress?: () => void;
  /** Момент смены цифры: вибрация, подпрыгивание рубашек. */
  onSwap?: () => void;
};
