import type { HeroCardTheme } from '../../config/heroCardThemes';

export type CardSparksProps = {
  theme: HeroCardTheme;
  /** Играть один раз при открытии; нет — искр нет. */
  animate: boolean;
};
