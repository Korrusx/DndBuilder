import type { Campaign } from '@/entities/campaign';

export type JoinCampaignSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Персонаж прикреплён к кампании. */
  onJoined: (campaign: Campaign) => void;
};
