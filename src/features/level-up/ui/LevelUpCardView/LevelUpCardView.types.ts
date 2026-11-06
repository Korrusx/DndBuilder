import type { TextContext } from '../../lib/cardText';
import type { LevelChoice, LevelUpCard, PickedItem } from '../../model/types';

export type LevelUpCardViewProps = {
  card: LevelUpCard;
  /** Развёрнута (открытая карта); иначе свёрнута одной строкой. Закрытая — всегда рубашка. */
  expanded: boolean;
  /** Только что открыта — «только что» в шапке. */
  fresh?: boolean;
  /** Выбранное на этом уровне (чипы выбора и магии). */
  picked: PickedItem[];
  /** Необязательный выбор оставлен как есть («Не менять»). */
  kept: boolean;
  /** Выбор на карте закрыт (обязательный сделан, необязательный выбран или «Не менять»). */
  settled: boolean;
  context?: TextContext;
  /** Ячейки по кругам до и после — для карты магии. */
  slots?: { before: number[]; after: number[] };
  /** Пояснение под выбором («Компетентность уже есть: …»). */
  note?: string;
  /** Нажатие на рубашку: открыть и развернуть. */
  onOpen: () => void;
  /** Нажатие на свёрнутую карту или шапку развёрнутой. */
  onToggle: () => void;
  onChoose: (choice: LevelChoice) => void;
  onKeep: (choice: LevelChoice) => void;
  /** «Подробнее»: полное описание в шторке. */
  onMore: (card: LevelUpCard) => void;
};

/** Части карты получают те же данные, что и сама карта. */
export type CardPartProps = Omit<LevelUpCardViewProps, 'expanded'>;
