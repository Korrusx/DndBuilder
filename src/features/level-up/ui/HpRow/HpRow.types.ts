import type { LevelUpCard } from '../../model/types';

export type HpRowProps = {
  card: LevelUpCard;
  /** Хиты уровня уже решены (брошены, среднее или свой кубик). */
  decided: boolean;
  /** Перейти на экран бросков хитов (У2), если хиты ещё не решены. */
  onRoll: () => void;
};
