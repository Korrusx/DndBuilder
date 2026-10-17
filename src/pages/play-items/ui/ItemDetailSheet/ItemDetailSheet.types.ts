import type { InventoryItem } from '@/entities/character';

export type ItemDetailSheetProps = {
  item: InventoryItem | null;
  index: number;
  onEquip: () => void;
  onMagicBonus: () => void;
  onQty: (qty: number) => void;
  onRemove: () => void;
  onClose: () => void;
};
