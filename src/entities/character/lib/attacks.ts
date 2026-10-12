import { nameOf } from '@/shared/content';

import type { WeaponAttack } from '../model/types';

/** Название атаки: «Кинжал», магическое — «Кинжал +1». */
export function attackName(a: Pick<WeaponAttack, 'itemId' | 'magicBonus'>): string {
  return `${nameOf('equipment', a.itemId)}${a.magicBonus ? ` +${a.magicBonus}` : ''}`;
}
