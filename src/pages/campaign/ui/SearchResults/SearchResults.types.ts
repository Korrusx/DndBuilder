import type { Entity, Entry, Session } from '@/entities/campaign';

export type SearchResultsProps = {
  query: string;
  entries: Entry[];
  sessions: Session[];
  entitiesById: ReadonlyMap<string, Entity>;
  onMentionPress: (entityId: string) => void;
};
