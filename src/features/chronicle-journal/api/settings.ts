// Настройки журнала хроники в пользовательской базе (meta.chronicleSettings).

import type { SQLiteDatabase } from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useSyncExternalStore } from 'react';

import { getMeta, setMeta } from '@/shared/db';

import { DEFAULT_JOURNAL_SETTINGS } from '../config/constants';
import { parseJournalSettings } from '../model/settings';
import type { JournalSettings } from '../model/types';

let current: JournalSettings = DEFAULT_JOURNAL_SETTINGS;
let loaded = false;
const listeners = new Set<() => void>();

function emit(next: JournalSettings) {
  current = next;
  loaded = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Текущие настройки (читаются из базы один раз). */
export async function loadJournalSettings(db: SQLiteDatabase): Promise<JournalSettings> {
  if (!loaded) {
    emit(parseJournalSettings(await getMeta(db, 'chronicleSettings')));
  }
  return current;
}

export async function saveJournalSettings(db: SQLiteDatabase, settings: JournalSettings): Promise<void> {
  emit(settings);
  await setMeta(db, 'chronicleSettings', JSON.stringify(settings));
}

export function useJournalSettings(): JournalSettings {
  const db = useSQLiteContext();
  useEffect(() => {
    loadJournalSettings(db).catch(() => undefined);
  }, [db]);
  return useSyncExternalStore(subscribe, () => current);
}
