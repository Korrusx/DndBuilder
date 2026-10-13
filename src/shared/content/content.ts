// Доступ к справочнику. Файл assets/content/content.json собирается командой `npm run data:build`.

import { currentLanguage } from '@/shared/i18n/model';

import data from '../../../assets/content/content.json';
import type { Content, ContentIndex, Edition, LocalizedText } from './types';

export type * from './types';

/** Справочник 2024 (SRD 5.2) — основной. */
export const content = data as unknown as Content;

let content2014: Content | undefined;

/**
 * Справочник редакции. 2014 (SRD 5.1, assets/content/content-2014.json, `npm run data:build:2014`)
 * загружается при первом обращении, чтобы не замедлять запуск тем, кто играет только по 2024.
 */
export function contentFor(edition: Edition): Content {
  if (edition === '2024') return content;
  content2014 ??= require('../../../assets/content/content-2014.json') as Content;
  return content2014;
}

const indexCache = new WeakMap<Content, ContentIndex>();

/** Таблицы для быстрого поиска по id. Строятся один раз на каждый справочник (в тестах их бывает несколько). */
export function indexOf(c: Content): ContentIndex {
  let idx = indexCache.get(c);
  if (!idx) {
    const entries = Object.entries(c).filter(([, v]) => Array.isArray(v)) as [string, { id: string }[]][];
    idx = Object.fromEntries(entries.map(([key, items]) => [key, new Map(items.map((x) => [x.id, x]))])) as unknown as ContentIndex;
    indexCache.set(c, idx);
  }
  return idx;
}

/** Таблицы поиска по id для справочника приложения. */
export const byId = indexOf(content);

/**
 * Текст для показа на текущем языке. Если текста на этом языке нет — текст на другом языке
 * с флагом `translated: false` (для пометки).
 */
export function tr(text: LocalizedText | undefined): { text: string; translated: boolean } {
  if (!text) return { text: '', translated: true };
  if (currentLanguage() === 'en') return text.en ? { text: text.en, translated: true } : { text: text.ru ?? '', translated: false };
  return text.ru ? { text: text.ru, translated: true } : { text: text.en, translated: false };
}

/** Доля переведённых текстов (для страницы «О приложении»). */
export function translationProgress(): { done: number; total: number } {
  let done = 0;
  let total = 0;
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      if ('en' in v && typeof (v as LocalizedText).en === 'string') {
        total++;
        if ((v as LocalizedText).ru) done++;
      } else Object.values(v).forEach(walk);
    }
  };
  walk(content);
  return { done, total };
}
