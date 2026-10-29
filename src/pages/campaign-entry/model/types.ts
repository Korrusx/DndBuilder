import type { EntryTag } from '@/entities/campaign';

/** Черновик записи: сохраняется сам, пока игрок печатает (meta.chronicleDraft). */
export type EntryDraft = {
  campaignId: string;
  /** Какую запись меняют; null — новая. */
  entryId: string | null;
  /** Текст с токенами упоминаний. */
  text: string;
  tags: EntryTag[];
  secret: boolean;
  photoIds: string[];
};
