import type { OriginFeatSlot } from '@/entities/character';

export type MagicInitiateProps = {
  slot: OriginFeatSlot;
  fixedList?: string;
  setChoice: (key: string, ids: string[]) => void;
};
