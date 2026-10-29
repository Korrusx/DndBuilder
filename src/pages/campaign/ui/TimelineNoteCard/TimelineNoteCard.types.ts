import type { Entity, Entry } from '@/entities/campaign';

export type TimelineNoteCardProps = {
  entry: Entry;
  entitiesById: ReadonlyMap<string, Entity>;
  /** Фото по id (data-URI). */
  photos: Record<string, string>;
  onLongPress: () => void;
  onMentionPress?: (entityId: string) => void;
};
