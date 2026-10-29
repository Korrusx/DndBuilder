import type { ChronicleEventType } from '@/entities/campaign';

import { DEFAULT_JOURNAL_SETTINGS, EVENT_GROUP, JOURNAL_GROUPS } from '../config/constants';
import type { JournalGroup, JournalSettings } from './types';

/** Настройки из базы; неизвестное и испорченное — значения по умолчанию. */
export function parseJournalSettings(raw: string | null): JournalSettings {
  if (!raw) {
    return DEFAULT_JOURNAL_SETTINGS;
  }
  try {
    const data = JSON.parse(raw) as { disabled?: unknown };
    const disabled = Array.isArray(data.disabled)
      ? JOURNAL_GROUPS.filter((group) => (data.disabled as unknown[]).includes(group))
      : [];
    return { disabled };
  } catch {
    return DEFAULT_JOURNAL_SETTINGS;
  }
}

export function isRecorded(settings: JournalSettings, type: ChronicleEventType): boolean {
  const group = EVENT_GROUP[type];
  return group === null || !settings.disabled.includes(group);
}

export function toggleGroup(settings: JournalSettings, group: JournalGroup): JournalSettings {
  const disabled = settings.disabled.includes(group)
    ? settings.disabled.filter((other) => other !== group)
    : [...settings.disabled, group];
  return { disabled: JOURNAL_GROUPS.filter((other) => disabled.includes(other)) };
}
