import type { InventoryItem } from '@/entities/character';

export type AddItemSheetProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: InventoryItem) => void;
};
