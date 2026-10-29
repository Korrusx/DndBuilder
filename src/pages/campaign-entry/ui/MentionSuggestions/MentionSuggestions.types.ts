import type { Entity, EntityType, Entry } from '@/entities/campaign';

export type MentionSuggestionsProps = {
  query: string;
  entities: Entity[];
  entries: Entry[];
  onPick: (entity: Entity) => void;
  onCreate: (type: EntityType) => void;
};
