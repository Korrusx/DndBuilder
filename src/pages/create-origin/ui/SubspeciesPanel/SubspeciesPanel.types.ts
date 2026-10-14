import type { Species } from '@/shared/content';

export type SubspeciesPanelProps = {
  species: Species;
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Подсказка над списком («Родословная, предок или наследие — выберите одно»). */
  hint: string;
};
