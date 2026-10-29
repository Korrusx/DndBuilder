import type { Entity, Entry, TimelineGroup, TimelineItem } from '@/entities/campaign';

export type TimelineBlockProps = {
  group: TimelineGroup;
  expanded: boolean;
  onToggle: () => void;
  entitiesById: ReadonlyMap<string, Entity>;
  photos: Record<string, string>;
  /** Идущую сессию можно завершить. */
  onEndSession?: () => void;
  /** Завершённой сессии можно написать или поправить «Где остановились». */
  onEditStop?: () => void;
  onDeleteEvent: (item: Extract<TimelineItem, { kind: 'event' }>) => void;
  onNoteLongPress: (entry: Entry) => void;
  onMentionPress?: (entityId: string) => void;
};
