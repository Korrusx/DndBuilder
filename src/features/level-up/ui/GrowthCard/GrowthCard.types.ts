import type { TextContext } from '../../lib/cardText';
import type { LevelUpCard } from '../../model/types';

export type GrowthCardProps = {
  card: LevelUpCard;
  /** Раскрыт список «Изменилось N чисел» (не сворачивает другие карты). */
  open: boolean;
  onToggle: () => void;
  context?: TextContext;
};
