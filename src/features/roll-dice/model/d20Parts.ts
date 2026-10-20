import { exhaustionPenalty } from '@/entities/character';
import { activeEdition } from '@/shared/content';
import { t } from '@/shared/i18n';

import type { RollPart } from './types';

/**
 * Слагаемые броска к20 с учётом истощения (SRD 5.2: −2 за уровень). В 2014 (редакция открытого персонажа)
 * истощение даёт помеху, а не штраф — слагаемого нет, помеху игрок включает переключателем.
 */
export function d20Parts(parts: RollPart[], exhaustion: number): RollPart[] {
  const all = parts.filter((p) => p.value !== 0);
  if (exhaustion > 0 && activeEdition() !== '2014') all.push({ label: t('roll.exhaustion', { level: exhaustion }), value: exhaustionPenalty(exhaustion) });
  return all;
}
