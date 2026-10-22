import type { CharacterSheet, SlotId } from '@/entities/character';
import type { Equipment, MagicItem } from '@/shared/content';

export type SlotCardProps = {
  selectedSlot: SlotId;
  selectedItemId: string | null;
  selectedItem: Equipment | MagicItem | undefined;
  attacks: CharacterSheet['attacks'];
  onUnequip: () => void;
};
