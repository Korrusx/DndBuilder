// Отложенное повышение уровня (docs/features/level-up.md, раздел 9): выборы копятся в `pendingLevelUp`,
// к персонажу повышение применяется один раз в конце, перед этим сохраняется снимок для отмены. Чистые функции.

import type { Character, HpChoice, PendingLevelUp } from '@/entities/character';
import { totalLevel } from '@/entities/character';
import type { Content } from '@/shared/content';

import { PENDING_FIELDS } from '../config/constants';
import { finishLevelUp, leveledClassId, startLevelUp } from './levelup';

/** Персонаж без отложенного повышения и снимка отмены — то, что хранится в снимке. */
export function levelUpBase(c: Character): Omit<Character, 'pendingLevelUp' | 'levelUpUndo'> {
  const { pendingLevelUp: _pending, levelUpUndo: _undo, ...base } = c;
  return base;
}

/** Ключ броска хитов: класс и его уровень («rogue.6»). */
export function hpRollKey(classId: string, classLevel: number): string {
  return `${classId}.${classLevel}`;
}

/** Начать повышение уровня класса `classId` (или нового класса — мультикласс). */
export function beginLevelUp(c: Character, classId: string, now: string): PendingLevelUp {
  return { fromLevel: totalLevel(c.classes), classId, choices: {}, revealed: [], startedAt: now };
}

/** Есть ли незаконченное повышение для текущего уровня персонажа. */
export function activePending(c: Character): PendingLevelUp | undefined {
  const pending = c.pendingLevelUp;
  return pending && pending.fromLevel === totalLevel(c.classes) ? pending : undefined;
}

/** Записать (или убрать при «среднем») бросок хитов нового уровня в черновик. */
export function withHpChoice(next: Character, prev: Character, hp: HpChoice | undefined): Character {
  const classId = leveledClassId(next, prev);
  const level = next.classes.find((e) => e.classId === classId)?.level ?? 1;
  const key = hpRollKey(classId, level);
  const { [key]: _old, ...rest } = next.hpRolls ?? {};
  const hpRolls = hp && hp.method !== 'average' ? { ...rest, [key]: hp.value } : rest;
  return { ...next, hpRolls };
}

/** Черновик повышения: персонаж на следующем уровне с выборами и хитами из отложенного повышения. */
export function pendingDraft(c: Character, pending = activePending(c)): Character | undefined {
  if (!pending) {
    return undefined;
  }
  const prev = levelUpBase(c) as Character;
  const next = { ...startLevelUp(prev, pending.classId), ...pending.choices } as Character;
  return withHpChoice(next, prev, pending.hp);
}

/** Сохранить выборы из черновика в отложенное повышение. */
export function storeDraft(c: Character, next: Character): Character {
  const pending = activePending(c);
  if (!pending) {
    return c;
  }
  const choices = Object.fromEntries(PENDING_FIELDS.map((field) => [field, next[field]]));
  return { ...c, pendingLevelUp: { ...pending, choices } };
}

/**
 * Закрепить хиты уровня. Брошенное значение закреплено: его нельзя сменить ни новым броском, ни «средним»,
 * пока не включена настройка «Разрешить переброс хитов».
 */
export function setPendingHp(c: Character, hp: HpChoice | undefined, allowReroll: boolean): Character {
  const pending = activePending(c);
  if (!pending || (pending.hp?.method === 'roll' && !allowReroll)) {
    return c;
  }
  return { ...c, pendingLevelUp: { ...pending, hp } };
}

/** Отметить перевёрнутые карты. */
export function revealCards(c: Character, ids: string[]): Character {
  const pending = activePending(c);
  if (!pending) {
    return c;
  }
  const revealed = [...new Set([...pending.revealed, ...ids])];
  return { ...c, pendingLevelUp: { ...pending, revealed } };
}

/**
 * Применить повышение одной записью: существующая логика (`finishLevelUp`) на черновике, запоминание способа
 * получения хитов и снимок персонажа до повышения для отмены.
 */
export function applyLevelUp(c: Character, content: Content): Character {
  const pending = activePending(c);
  const next = pendingDraft(c, pending);
  if (!pending || !next) {
    return c;
  }
  const prev = levelUpBase(c);
  const done = finishLevelUp(next, prev as Character, content);
  const method = pending.hp?.method ?? 'average';
  return {
    ...levelUpBase(done),
    hpMethod: method === 'manual' ? c.hpMethod : method,
    levelUpUndo: { level: totalLevel(done.classes), snapshot: prev },
  };
}

/** Можно ли отменить последнее повышение: снимок есть и после него уровней не прибавлялось. */
export function canUndoLevelUp(c: Character): boolean {
  return !!c.levelUpUndo && totalLevel(c.classes) === c.levelUpUndo.level;
}

/** Вернуть персонажа к снимку перед последним повышением. */
export function undoLevelUp(c: Character): Character {
  if (!canUndoLevelUp(c)) {
    return c;
  }
  return { ...(c.levelUpUndo!.snapshot as Character), id: c.id };
}
