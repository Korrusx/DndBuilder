import type { Character, InventoryItem, SlotId } from '@/entities/character';
import type { Equipment, MagicItem } from '@/shared/content';

export type Candidate = { inv: InventoryItem; item: Equipment | MagicItem };

export type CandidatesSectionProps = {
  candidates: Candidate[];
  selectedSlot: SlotId;
  mainIsTwoHanded: boolean;
  equippedSlots: Partial<Record<string, string>>;
  attuned: number;
  currentAc: number;
  character: Character;
  onEquip: (slotId: SlotId, itemId: string) => void;
};
