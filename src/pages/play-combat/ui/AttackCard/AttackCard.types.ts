import type { WeaponAttack } from '@/entities/character';
import type { D20Request, DamageRequest } from '@/features/roll-dice';

export type AttackCardProps = {
  attack: WeaponAttack;
  weaponMasteries: string[];
  exhaustion: number;
  onRoll: (req: D20Request) => void;
  onDamage: (req: DamageRequest) => void;
  onInfo: (info: { title: string; text: string }) => void;
};
