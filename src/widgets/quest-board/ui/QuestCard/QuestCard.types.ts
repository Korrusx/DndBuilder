import type { Entity, QuestCounter, QuestStep } from '@/entities/campaign';

export type QuestCardProps = {
  quest: Entity;
  steps: QuestStep[];
  counter: QuestCounter | null;
  entitiesById: ReadonlyMap<string, Entity>;
  /** «Не трогали с сессии N». */
  staleSince: number | null;
  onOpen: () => void;
  onOpenEntity: (entityId: string) => void;
  onToggleStep: (step: QuestStep) => void;
  /** Есть, если счётчик привязан к кошельку. */
  onPay?: () => void;
};
