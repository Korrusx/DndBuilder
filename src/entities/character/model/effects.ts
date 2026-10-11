// Механические эффекты умений, особенностей вида и черт, которые влияют на расчёты.
// В справочнике эффекты описаны только текстом, поэтому здесь — таблица «id → эффект».
// Источник каждого эффекта — текст соответствующей записи SRD 5.2 (см. комментарии).

import { EFFECTS } from '../config/effects';
import type { Effect } from './types';

export function effectsOf(ids: Iterable<string>): Effect[] {
  const out: Effect[] = [];
  for (const id of ids) out.push(...(EFFECTS[id] ?? []));
  return out;
}
