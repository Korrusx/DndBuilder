import type { CampaignData } from '@/entities/campaign';
import type { Character } from '@/entities/character';

export type QuestBoardProps = {
  data: CampaignData;
  /** Действующие герои — для «Внести из кошелька». */
  heroes: Character[];
  onOpenEntity: (entityId: string) => void;
  onCreate: () => void;
  /** Что-то изменилось — перечитать кампанию. */
  onChanged: () => void;
};
