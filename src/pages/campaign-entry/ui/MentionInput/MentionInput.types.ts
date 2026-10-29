import type { MentionDoc } from '@/entities/campaign';

export type MentionInputProps = {
  doc: MentionDoc;
  onChange: (doc: MentionDoc) => void;
  onCursor: (cursor: number) => void;
  /** Поставить курсор сюда (после вставки упоминания); сбрасывается после первого движения. */
  forcedCursor: number | null;
  placeholder: string;
};
