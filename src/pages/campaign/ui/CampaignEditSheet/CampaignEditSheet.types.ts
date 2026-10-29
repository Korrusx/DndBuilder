import type { Campaign } from '@/entities/campaign';

export type CampaignEditSheetProps = {
  campaign: Campaign;
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, gmName: string) => void;
  onExport: () => void;
};
