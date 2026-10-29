import type { Entity, TimelineItem } from '@/entities/campaign';

export type TimelineEventRowProps = {
  item: Extract<TimelineItem, { kind: 'event' }>;
  entitiesById: ReadonlyMap<string, Entity>;
  /** Смахнули — удалить событие (все склеенные записи). */
  onDelete: () => void;
};
