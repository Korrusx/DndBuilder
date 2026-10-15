// Настройки бросков (3D или простой, анимация, вид кубиков и стола, звук) хранятся в пользовательской базе (meta.diceSettings).

import type { SQLiteDatabase } from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useSyncExternalStore } from 'react';

import { getMeta, setMeta } from '@/shared/db';

import { DEFAULT_DICE_SETTINGS } from '../config/diceSettings';
import { parseDiceSettings } from './parseDiceSettings';
import type { DiceSettings } from './types';

let current: DiceSettings = DEFAULT_DICE_SETTINGS;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(next: DiceSettings) {
  current = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function load(db: SQLiteDatabase): Promise<void> {
  loading ??= getMeta(db, 'diceSettings').then((raw) => emit(parseDiceSettings(raw)));
  return loading;
}

/** Текущие настройки бросков; при первом вызове читает их из базы. */
export function useDiceSettings(): DiceSettings {
  const db = useSQLiteContext();
  useEffect(() => {
    load(db).catch(() => undefined);
  }, [db]);
  return useSyncExternalStore(subscribe, () => current);
}

export async function setDiceSettings(db: SQLiteDatabase, patch: Partial<DiceSettings>): Promise<void> {
  await load(db).catch(() => undefined);
  const next = { ...current, ...patch };
  emit(next);
  await setMeta(db, 'diceSettings', JSON.stringify(next));
}
