import type { Entity } from '@/entities/campaign';

import type { CampaignTab } from '../../model/types';

export type EntityListTabProps = {
  tab: Exclude<CampaignTab, 'chronicle' | 'quests'>;
  entities: Entity[];
  onOpen: (entityId: string) => void;
};
