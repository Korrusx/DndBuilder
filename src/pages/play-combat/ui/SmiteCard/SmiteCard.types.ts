import type { GameState } from '@/entities/character';
import type { DamageRequest } from '@/features/roll-dice';

export type SmiteCardProps = {
  slots: number[];
  hasFreeSmiteFeature: boolean;
  freeSmiteLeft: number;
  characterState: GameState;
  onDamage: (req: DamageRequest) => void;
  onUpdateState: (fn: (s: GameState) => GameState) => void;
};
