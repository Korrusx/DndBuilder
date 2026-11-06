import type { RefObject } from 'react';
import type { ViewInstance } from 'react-native';

import type { HpChoice } from '@/entities/character';

import type {
  Deck,
  LevelChoice,
  LevelSnapshot,
  LevelUpCard,
  PickedItem,
  ScreenPoint,
  TextContext,
} from '@/features/level-up';

export type CardsStepProps = {
  deck: Deck;
  before: LevelSnapshot;
  after: LevelSnapshot;
  /** Новый общий уровень — значок в шапке. */
  level: number;
  capstone: boolean;
  /** Переход из ритуала: центр кольца, из которого раздаются карты. Нет — колода сразу на месте. */
  intro: ScreenPoint | null;
  /** Значок скрыт, пока в него летит кольцо. */
  badgeHidden: boolean;
  badgeRef: RefObject<ViewInstance | null>;
  onBadgeLayout: () => void;
  /** «Новое на 5-м уровне». */
  title: string;
  /** «Каэлан · паладин · драконорождённый». */
  subtitle: string;
  /** Хиты уровня решены; нет — карта хитов развёрнута первой, «Дальше» неактивна. */
  hpDecided: boolean;
  /** Закреплённый результат хитов из отложенного повышения. */
  hp: HpChoice | undefined;
  /** Кость хитов класса уровня. */
  die: number;
  allowReroll: boolean;
  /** «Бросаю свои кубики»: «Ввести свой кубик» — первой кнопкой. */
  ownDice: boolean;
  onHp: (hp: HpChoice) => void;
  /** «Без изменений на этом уровне: …»; пусто — строки нет. */
  unchanged: string;
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
  onReveal: (ids: string[]) => void;
  onChoose: (choice: LevelChoice) => void;
  onKeep: (choice: LevelChoice) => void;
  onMore: (card: LevelUpCard) => void;
  onNext: () => void;
};
