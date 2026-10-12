import type { D20Mode, D20Roll } from '@/shared/lib/dice';

export type RollPart = { label: string; value: number };

export type D20Request = {
  title: string;
  parts: RollPart[];
  mode?: D20Mode;
  /** Уже сделанный бросок (спасбросок от смерти): только показать, без переброса. */
  roll?: D20Roll;
};

export type DamageRequest = {
  title: string;
  dice: string;
  bonus: number;
  damageType?: string;
  /** «Сражение большим оружием»: 1 и 2 на костях считаются за это число. */
  minDie?: number;
};
