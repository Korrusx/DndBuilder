import type { TextContext } from '../../lib/cardText';
import type { CardRow } from '../../model/types';

export type RowListProps = {
  rows: CardRow[];
  context?: TextContext;
  /** Цвет нового значения (акцент типа карты). */
  accent?: string;
  /** В рамке-поверхности с разделителями (как в макете У7). */
  boxed?: boolean;
};
