// Механические эффекты умений, особенностей вида и черт, которые влияют на расчёты.
// В справочнике эффекты описаны только текстом, поэтому здесь — таблица «id → эффект».
// Источник каждого эффекта — текст соответствующей записи SRD 5.2 (см. комментарии).

import type { Edition } from '@/shared/content';

import { EFFECTS, EFFECTS_2014 } from '../config/effects';
import type { Effect } from './types';

export function effectsOf(ids: Iterable<string>, edition: Edition = '2024'): Effect[] {
  const out: Effect[] = [];
  for (const id of ids) {
    out.push(...((edition === '2014' ? EFFECTS_2014[id] : undefined) ?? EFFECTS[id] ?? []));
  }
  return out;
}
