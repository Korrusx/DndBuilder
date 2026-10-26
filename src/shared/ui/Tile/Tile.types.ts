import type { GameIconName } from '../GameIcon/GameIcon.types';

export type TileProps = {
  title: string;
  /** Одна короткая строка: «к12 · СИЛ», «Средний · 30 фт». */
  subtitle?: string;
  /** Метка над названием: «Подходит». */
  tag?: string;
  /** Иконка слева от названия и узор из неё у края невыбранной плитки. */
  icon?: GameIconName;
  selected?: boolean;
  onPress: () => void;
};
