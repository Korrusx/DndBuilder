import type { Deck, LevelChoice, LevelSnapshot, LevelUpCard, PickedItem, TextContext } from '@/features/level-up';

export type CardsStepProps = {
  deck: Deck;
  before: LevelSnapshot;
  after: LevelSnapshot;
  /** «Новое на 5-м уровне». */
  title: string;
  /** «Каэлан · паладин · драконорождённый». */
  subtitle: string;
  /** Хиты уровня решены; нет — у строки хитов кнопка «Бросить». */
  hpDecided: boolean;
  /** Карта, с которой вошли (нажатие на рубашку на первом экране): к ней сразу прокрутка. */
  focus: string | null;
  /** Выбранное на этом уровне по id карты. */
  picked: Record<string, PickedItem[]>;
  /** id необязательных выборов, оставленных как есть («Не менять»). */
  kept: string[];
  /** id необязательных выборов, которые закрыты (выбрано или «Не менять»). */
  settled: string[];
  animate: boolean;
  context: TextContext;
  /** Подсказки под выбором («уже есть: …») по id карты. */
  notes: Record<string, string>;
  onBack: () => void;
  onRollHp: () => void;
  onReveal: (ids: string[]) => void;
  onChoose: (choice: LevelChoice) => void;
  onKeep: (choice: LevelChoice) => void;
  onMore: (card: LevelUpCard) => void;
  onNext: () => void;
};
