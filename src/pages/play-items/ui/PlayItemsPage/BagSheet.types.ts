import type { InventoryItem, SlotId } from '@/entities/character';

export type BagSheetProps = {
  visible: boolean;
  bag: InventoryItem[];
  mainIsTwoHanded: boolean;
  onClose: () => void;
  onAdd: () => void;
  onEquip: (slotId: SlotId, itemId: string) => void;
  onRemove: (itemId: string, qty: number) => void;
};

export type BagRowProps = {
  inv: InventoryItem;
  mainIsTwoHanded: boolean;
  slotLabel: (slotId: SlotId) => string;
  onEquip: (slotId: SlotId, itemId: string) => void;
  onRemove: (itemId: string, qty: number) => void;
};
