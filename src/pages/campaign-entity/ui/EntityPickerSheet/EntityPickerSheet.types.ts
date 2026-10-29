import type { Entity } from '@/entities/campaign';

export type EntityPickerSheetProps = {
  visible: boolean;
  title: string;
  entities: Entity[];
  onClose: () => void;
  onPick: (entity: Entity) => void;
  /** Подпись поля (для связей — «как связаны»), если нужно. */
  labelPlaceholder?: string;
  /** Выбор с подписью: вызывается вместо onPick, когда есть поле подписи. */
  onPickWithLabel?: (entity: Entity, label: string) => void;
  /** «Убрать» (например, квест ни от кого). */
  onClear?: () => void;
};
