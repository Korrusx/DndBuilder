import { exhaustionPenalty } from '@/entities/character';
import { t } from '@/shared/i18n/model';

import type { RollPart } from './types';

/** Слагаемые броска к20 с учётом истощения. */
export function d20Parts(parts: RollPart[], exhaustion: number): RollPart[] {
  const all = parts.filter((p) => p.value !== 0);
  if (exhaustion > 0) all.push({ label: t('roll.exhaustion', { level: exhaustion }), value: exhaustionPenalty(exhaustion) });
  return all;
}
