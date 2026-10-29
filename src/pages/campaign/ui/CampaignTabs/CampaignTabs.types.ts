import type { CampaignTab } from '../../model/types';

export type CampaignTabsProps = {
  value: CampaignTab;
  onChange: (tab: CampaignTab) => void;
  counts: Record<Exclude<CampaignTab, 'chronicle'>, number>;
};
