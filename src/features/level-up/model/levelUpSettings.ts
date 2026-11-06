// Настройки повышения уровня (переброс хитов, анимации) хранятся в пользовательской базе (meta.levelUpSettings).

import type { SQLiteDatabase } from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useSyncExternalStore } from 'react';

import { getMeta, setMeta } from '@/shared/db';

import { DEFAULT_LEVEL_UP_SETTINGS } from '../config/settings';
import { parseLevelUpSettings } from './parseLevelUpSettings';
import type { LevelUpSettings } from './types';

let current: LevelUpSettings = DEFAULT_LEVEL_UP_SETTINGS;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(next: LevelUpSettings) {
  current = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function load(db: SQLiteDatabase): Promise<void> {
  loading ??= getMeta(db, 'levelUpSettings').then((raw) => emit(parseLevelUpSettings(raw)));
  return loading;
}

/** Текущие настройки повышения уровня; при первом вызове читает их из базы. */
export function useLevelUpSettings(): LevelUpSettings {
  const db = useSQLiteContext();
  useEffect(() => {
    load(db).catch(() => undefined);
  }, [db]);
  return useSyncExternalStore(subscribe, () => current);
}

export async function setLevelUpSettings(db: SQLiteDatabase, patch: Partial<LevelUpSettings>): Promise<void> {
  await load(db).catch(() => undefined);
  const next = { ...current, ...patch };
  emit(next);
  await setMeta(db, 'levelUpSettings', JSON.stringify(next));
}
