// Колода целиком (docs/features/level-up.md, 7.1): лист до → черновик с выборами → лист после → разница → карты.
// Вызывается заново после каждого выбора игрока.

import type { Character, HpChoice } from '@/entities/character';
import type { Content } from '@/shared/content';

import { levelChoices } from '../levelChoices';
import { leveledClassId, levelUpPlan } from '../levelup';
import { withHpChoice } from '../pending';
import type { Deck, LevelSnapshot, SheetDiff } from '../types';
import { buildDeck } from './buildDeck';
import { classifyChanges } from './classifyChanges';
import { diffSheets } from './diffSheets';
import { levelSnapshot } from './snapshot';

export type LevelUpDeckResult = Deck & { diff: SheetDiff; before: LevelSnapshot; after: LevelSnapshot };

/**
 * `prev` — персонаж до повышения, `next` — черновик повышения (startLevelUp + выборы игрока).
 * `hp` — закреплённые хиты уровня: бросок попадает в черновик, и карта хитов сходится с листом.
 */
export function levelUpDeck(
  prev: Character,
  next: Character,
  content: Content,
  options: { hp?: HpChoice; revealed?: string[] } = {},
): LevelUpDeckResult {
  const draft = options.hp ? withHpChoice(next, prev, options.hp) : next;
  const before = levelSnapshot(prev, content);
  const after = levelSnapshot(draft, content);
  const diff = diffSheets(before, after, content);
  const classId = leveledClassId(draft, prev);
  const plan = levelUpPlan(draft, content, classId);
  const cards = classifyChanges(diff, {
    content,
    classId: plan.classId,
    isNewClass: plan.isNewClass,
    speciesId: draft.speciesId,
    after,
    ...(options.hp ? { hp: options.hp } : {}),
  });
  const deck = buildDeck(cards, levelChoices(draft, prev, content), { revealed: options.revealed, diff });
  return { ...deck, diff, before, after };
}
