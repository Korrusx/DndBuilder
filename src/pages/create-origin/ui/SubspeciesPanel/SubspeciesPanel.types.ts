import type { VariantOption } from '../../model/types';

export type SubspeciesPanelProps = {
  options: VariantOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Подсказка над списком («Родословная, предок или наследие — выберите одно»). */
  hint: string;
};
