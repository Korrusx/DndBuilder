import type { CharacterSheet, SlotId } from '@/entities/character';

export type CharacterDollProps = {
  equippedSlots: Partial<Record<string, string>>;
  selectedSlot: SlotId;
  onSelectSlot: (slot: SlotId) => void;
  attacks: CharacterSheet['attacks'];
};
