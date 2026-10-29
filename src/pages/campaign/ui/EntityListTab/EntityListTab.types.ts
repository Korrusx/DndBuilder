import type { Entity } from '@/entities/campaign';

import type { CampaignTab } from '../../model/types';

export type EntityListTabProps = {
  tab: Exclude<CampaignTab, 'chronicle' | 'quests'>;
  entities: Entity[];
  /** Портреты по id фото (data-URI). */
  photos: Record<string, string>;
  onOpen: (entityId: string) => void;
};
