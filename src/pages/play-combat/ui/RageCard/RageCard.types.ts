import type { ResourceView } from '@/entities/character';

export type RageCardProps = {
  rage: ResourceView;
  rageLeft: number;
  rageBonus: number | undefined;
  isRaging: boolean;
  onStart: () => void;
  onEnd: () => void;
};
