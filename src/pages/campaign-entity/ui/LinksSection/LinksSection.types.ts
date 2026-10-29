import type { Entity, EntityLink } from '@/entities/campaign';

export type LinksSectionProps = {
  entity: Entity;
  links: EntityLink[];
  entitiesById: ReadonlyMap<string, Entity>;
  onOpen: (entityId: string) => void;
  onAdd: () => void;
  onDelete: (link: EntityLink) => void;
};
