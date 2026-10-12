import type { GAME_ICONS } from '@/shared/config';

export type GameIconName = keyof typeof GAME_ICONS;

export type GameIconProps = {
  name: GameIconName;
  size: number;
  color: string;
};
