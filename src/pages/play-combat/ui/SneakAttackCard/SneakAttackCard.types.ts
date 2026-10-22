import type { DamageRequest } from '@/features/roll-dice';

export type SneakAttackCardProps = {
  diceCount: number;
  diceSides: number;
  onDamage: (req: DamageRequest) => void;
};
