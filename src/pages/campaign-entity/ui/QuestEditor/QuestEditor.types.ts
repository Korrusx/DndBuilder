import type { Entity, QuestCounter, QuestStatus, QuestStep } from '@/entities/campaign';

export type QuestEditorProps = {
  quest: Entity;
  steps: QuestStep[];
  counter: QuestCounter | null;
  entitiesById: ReadonlyMap<string, Entity>;
  onPatch: (patch: Partial<Entity>) => void;
  onStatus: (status: QuestStatus) => void;
  onPickGiver: () => void;
  onOpen: (entityId: string) => void;
  /** Шаги или счётчик изменились — перечитать. */
  onChanged: () => void;
};
