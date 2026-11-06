import type { CardStyle } from '../../config/heroCardThemes';

export type StyleBackdropProps = {
  style: CardStyle;
  /** Плавный переход за 300 мс при смене стиля; нет — сразу. */
  animate: boolean;
  /** Центр градиента по вертикали (доля высоты): экран 0,38, пост 0,45, сторис 0,46. */
  centerY?: number;
  /** Стопы градиента; по умолчанию 0 / 48 / 80 %, у сторис — 0 / 45 / 78 %. */
  positions?: [number, number, number];
};
