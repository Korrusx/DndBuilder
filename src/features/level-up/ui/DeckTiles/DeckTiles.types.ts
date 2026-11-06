import type { LevelUpCard } from '../../model/types';

export type DeckTilesProps = {
  cards: LevelUpCard[];
  /** Развёрнутая в списке карта. */
  current: string | null;
  /** id необязательных выборов, закрытых «Не менять» или выбором (точка «нужен выбор» гаснет). */
  settled: string[];
  onSelect: (id: string) => void;
  /** Переход из ритуала: плитки появляются с этой задержки (мс) по одной. */
  appearAt?: number;
};

export type DeckTileProps = {
  card: LevelUpCard;
  current: boolean;
  needsChoice: boolean;
  /** Ширина плитки, когда лента прокручивается; нет — плитка тянется на свою колонку. */
  width?: number;
  onPress: () => void;
};
