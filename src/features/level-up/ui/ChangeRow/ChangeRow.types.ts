import type { TextContext } from '../../lib/cardText';
import type { CardRow } from '../../model/types';

export type ChangeRowProps = {
  row: CardRow;
  context?: TextContext;
  /** `card` — строка на карте (14 / 12 / 13), `list` — в раскрытом списке роста (13 / 11 / 12). */
  size?: 'card' | 'list';
  /** Цвет «стало» и названия (цвета вида на карте вида). */
  color?: string;
};
