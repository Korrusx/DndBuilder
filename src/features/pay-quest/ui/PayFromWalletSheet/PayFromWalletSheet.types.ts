import type { Entity, QuestCounter } from '@/entities/campaign';
import type { Character } from '@/entities/character';

export type PayFromWalletSheetProps = {
  /** Квест со счётчиком; null — окно закрыто. */
  quest: Entity | null;
  counter: QuestCounter | null;
  /** Действующие герои кампании — из чьего кошелька платить. */
  heroes: Character[];
  onClose: () => void;
  onPaid: () => void;
};
