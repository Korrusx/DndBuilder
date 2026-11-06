import type { LevelUpCard } from '../../model/types';

export type HpCardProps = {
  /** Карта хитов колоды (разбор и «было → стало» — по выбранному способу). */
  card: LevelUpCard;
  /** Хиты уровня решены (брошены, среднее или свой кубик). */
  decided: boolean;
  expanded: boolean;
  /** Сразу после броска: 600 мс в карте итог с разбором, потом карта сворачивается. */
  showResult: boolean;
  /** Настройка «Разрешить переброс хитов»: после броска снова видны кнопки. */
  canReroll: boolean;
  /** «Бросаю свои кубики»: «Ввести свой кубик» — первой кнопкой. */
  ownDice: boolean;
  onToggle: () => void;
  onRoll: () => void;
  onAverage: () => void;
  onManual: () => void;
};

export type DieShapeProps = {
  /** Граней у кости: 6, 8, 10, 12. */
  sides: number;
  size?: number;
};
