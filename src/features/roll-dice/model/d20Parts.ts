import { exhaustionPenalty } from '@/entities/character';
import type { RollPart } from './types';

/** Слагаемые броска к20 с учётом истощения. */
export function d20Parts(parts: RollPart[], exhaustion: number): RollPart[] {
  const all = parts.filter((p) => p.value !== 0);
  if (exhaustion > 0) all.push({ label: `Истощение ${exhaustion}`, value: exhaustionPenalty(exhaustion) });
  return all;
}
