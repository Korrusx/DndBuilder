import type { DiceSettings, TableRoll } from '../../model/types';

export type DiceTableProps = {
  /** Бросок, который нужно показать; id меняется с каждым новым броском. */
  roll: TableRoll | null;
  settings: DiceSettings;
  /** Кубики остановились (или сцену не удалось показать — тогда сразу). */
  onLanded: (id: number) => void;
  /** 3D недоступно на этом устройстве: панель переключается на простой показ. */
  onError: () => void;
};
