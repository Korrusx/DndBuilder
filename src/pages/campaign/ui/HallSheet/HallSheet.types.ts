import type { Hero } from '../HeroChips/HeroChips.types';

export type HallSheetProps = {
  visible: boolean;
  heroes: Hero[];
  onClose: () => void;
  /** Вернуть героя в строй (ошиблись или воскресили). */
  onRestore: (hero: Hero) => void;
};
