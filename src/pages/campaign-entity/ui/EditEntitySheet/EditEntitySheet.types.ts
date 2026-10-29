import type { Entity } from '@/entities/campaign';

export type EditEntitySheetProps = {
  entity: Entity;
  visible: boolean;
  onClose: () => void;
  onSave: (patch: Pick<Entity, 'name' | 'role' | 'description'>) => void;
  onDelete: () => void;
};
