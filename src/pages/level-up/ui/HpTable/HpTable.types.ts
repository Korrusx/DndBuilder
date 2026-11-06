import type { DiceTableProps } from '@/features/roll-dice';

export type HpTableProps = {
  /** Бросок на столе; нет — стол скрыт. */
  roll: DiceTableProps['roll'];
  settings: DiceTableProps['settings'];
  onLanded: () => void;
  onError: () => void;
};
