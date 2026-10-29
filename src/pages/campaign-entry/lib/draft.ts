// Черновик записи хроники в пользовательской базе (один на всё приложение — последняя незаконченная запись).

import type { SQLiteDatabase } from 'expo-sqlite';

import { ENTRY_TAGS } from '@/entities/campaign';
import { getMeta, setMeta } from '@/shared/db';

import type { EntryDraft } from '../model/types';

export async function loadDraft(db: SQLiteDatabase): Promise<EntryDraft | null> {
  const raw = await getMeta(db, 'chronicleDraft');
  if (!raw) {
    return null;
  }
  try {
    const data = JSON.parse(raw) as Partial<EntryDraft>;
    if (typeof data.campaignId !== 'string' || typeof data.text !== 'string') {
      return null;
    }
    return {
      campaignId: data.campaignId,
      entryId: typeof data.entryId === 'string' ? data.entryId : null,
      text: data.text,
      tags: Array.isArray(data.tags) ? ENTRY_TAGS.filter((tag) => data.tags?.includes(tag)) : [],
      secret: data.secret === true,
      photoIds: Array.isArray(data.photoIds) ? data.photoIds.filter((id) => typeof id === 'string') : [],
    };
  } catch {
    return null;
  }
}

export const saveDraft = (db: SQLiteDatabase, draft: EntryDraft) =>
  setMeta(db, 'chronicleDraft', JSON.stringify(draft));

export const clearDraft = (db: SQLiteDatabase) => setMeta(db, 'chronicleDraft', '');

/** «Бор» → «Бор»; первая буква заглавная, чтобы созданная карточка выглядела как имя. */
export const entityNameFromQuery = (query: string) => {
  const name = query.trim().replace(/\s+/g, ' ');
  return name.charAt(0).toLocaleUpperCase() + name.slice(1);
};

/** Вставить «@» у курсора (с пробелом перед ним, если курсор прямо за словом). */
export function withAt(text: string, cursor: number): { text: string; cursor: number } {
  const before = text.slice(0, cursor);
  const at = before.length > 0 && !/\s$/.test(before) ? ' @' : '@';
  return { text: before + at + text.slice(cursor), cursor: cursor + at.length };
}
