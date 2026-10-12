// Выбранный язык хранится в пользовательской базе (meta.language).

import type { SQLiteDatabase } from 'expo-sqlite';

import { getMeta, setMeta } from '@/shared/db';

import { DEFAULT_LANGUAGE } from '../config/languages';
import { i18n, isLanguage } from './i18n';
import type { Language } from './types';

export async function loadLanguage(db: SQLiteDatabase): Promise<void> {
  const saved = await getMeta(db, 'language');
  await i18n.changeLanguage(isLanguage(saved) ? saved : DEFAULT_LANGUAGE);
}

export async function setLanguage(db: SQLiteDatabase, language: Language): Promise<void> {
  await i18n.changeLanguage(language);
  await setMeta(db, 'language', language);
}
