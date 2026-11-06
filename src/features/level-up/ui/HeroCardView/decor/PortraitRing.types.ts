import type { HeroCardTheme } from '../../../config/heroCardThemes';

export type PortraitRingProps = {
  theme: HeroCardTheme;
  /** Сторона портрета (128 или 100). */
  size: number;
  /** Толщина кольца. */
  ring: number;
};
