import type { HpChoice, HpMethod } from '@/entities/character';
import type { LevelUpCard } from '@/features/level-up';

export type HpStepProps = {
  /** Карта хитов колоды (разбор и «было → стало» уже с выбранным способом). */
  card: LevelUpCard;
  die: number;
  className: string;
  /** Закреплённый результат из отложенного повышения. */
  hp?: HpChoice;
  /** Способ по умолчанию — последний выбранный этим персонажем. */
  defaultMethod: HpMethod;
  allowReroll: boolean;
  onChange: (hp: HpChoice) => void;
};
