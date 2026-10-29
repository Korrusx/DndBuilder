// Квесты: прогресс по шагам или счётчику, давно не тронутые, взносы в счётчик.

import { t } from '@/shared/i18n';

import { STALE_AFTER_SESSIONS } from '../config/constants';
import { amountText } from './events';
import { parseMentions } from './mentions';
import type { Entity, Entry, QuestCounter, QuestProgress, QuestStep, Session, StaleQuest } from './types';

/** «2 из 3» по шагам или «180 из 500 зм» по счётчику (счётчик важнее). Null — у квеста нет ни того, ни другого. */
export function questProgress(steps: QuestStep[], counter?: QuestCounter | null): QuestProgress | null {
  if (counter && counter.target > 0) {
    const left = Math.max(0, counter.target - counter.current);
    return {
      label: t('chronicle.quest.counter', {
        current: counter.current,
        target: amountText(counter.target, counter.unit),
      }),
      remaining: left > 0 ? amountText(left, counter.unit) : '',
      fraction: Math.min(1, Math.max(0, counter.current / counter.target)),
    };
  }
  if (steps.length === 0) {
    return null;
  }
  const done = steps.filter((step) => step.done).length;
  const left = steps.length - done;
  return {
    label: t('chronicle.quest.steps', { done, total: steps.length }),
    remaining: left > 0 ? t('chronicle.quest.stepsLeft', { count: left }) : '',
    fraction: done / steps.length,
  };
}

/** Взнос в счётчик квеста. Сумма должна быть положительной; сверх цели можно (переплата видна в «из»). */
export function contributeToCounter(counter: QuestCounter, amount: number, now: string): QuestCounter {
  if (!Number.isFinite(amount) || amount <= 0) {
    return counter;
  }
  return { ...counter, current: counter.current + Math.floor(amount), updatedAt: now };
}

/** Номер сессии, во время которой (или последней перед которой) случилось событие; null — до первой сессии. */
function sessionNumberAt(at: string, sessions: Session[]): number | null {
  let number: number | null = null;
  for (const session of sessions) {
    if (session.startedAt <= at && (number === null || session.number > number)) {
      number = session.number;
    }
  }
  return number;
}

/**
 * Активные квесты, которых не касались `STALE_AFTER_SESSIONS` и более сессий: ни упоминаний в записях,
 * ни событий квеста, ни правок самого квеста, шагов и счётчика.
 */
export function staleQuests(
  quests: Entity[],
  entries: Entry[],
  sessions: Session[],
  currentSessionNumber: number,
  steps: QuestStep[] = [],
  counters: QuestCounter[] = [],
): StaleQuest[] {
  const sessionNumber = new Map(sessions.map((session) => [session.id, session.number]));
  const result: StaleQuest[] = [];
  for (const quest of quests) {
    if (quest.type !== 'quest' || (quest.status ?? 'active') !== 'active') {
      continue;
    }
    const touches: (number | null)[] = [
      sessionNumberAt(quest.updatedAt, sessions),
      ...steps.filter((step) => step.questId === quest.id).map((step) => sessionNumberAt(step.updatedAt, sessions)),
      ...counters
        .filter((counter) => counter.questId === quest.id)
        .map((counter) => sessionNumberAt(counter.updatedAt, sessions)),
    ];
    for (const entry of entries) {
      const about =
        (entry.kind === 'note' && parseMentions(entry.text).some((mention) => mention.entityId === quest.id)) ||
        (entry.kind === 'event' && entry.eventData?.questId === quest.id);
      if (about) {
        touches.push(entry.sessionId ? (sessionNumber.get(entry.sessionId) ?? null) : null);
      }
    }
    const known = touches.filter((number): number is number => number !== null);
    if (known.length === 0) {
      continue;
    }
    const last = Math.max(...known);
    if (currentSessionNumber - last >= STALE_AFTER_SESSIONS) {
      result.push({ quest, lastSessionNumber: last });
    }
  }
  return result;
}
