import type { D20Request, DamageRequest } from '@/features/roll-dice';

export type UnarmedCardProps = {
  toHit: number;
  damage: number;
  brawler: boolean;
  strMod: number;
  rageDamage: number;
  exhaustion: number;
  onRoll: (req: D20Request) => void;
  onDamage: (req: DamageRequest) => void;
};
