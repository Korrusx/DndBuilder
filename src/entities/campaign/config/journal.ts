import type { ChronicleEventType, JournalGroup, JournalSettings } from '../model/types';

export const JOURNAL_GROUPS: JournalGroup[] = ['rolls', 'health', 'level', 'loot', 'rest', 'combat', 'chronicle'];

/** Группа каждого вида события; null — записывается всегда (начало сессии). */
export const EVENT_GROUP: Record<ChronicleEventType, JournalGroup | null> = {
  natural: 'rolls',
  down: 'health',
  stabilized: 'health',
  died: 'health',
  level: 'level',
  loot: 'loot',
  rest: 'rest',
  combat: 'combat',
  quest: 'chronicle',
  person: 'chronicle',
  payment: 'chronicle',
  sessionStart: null,
};

export const DEFAULT_JOURNAL_SETTINGS: JournalSettings = { disabled: [] };
