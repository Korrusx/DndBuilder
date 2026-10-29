export type UndoBarProps = {
  /** Текст («Событие удалено»); пусто — плашка скрыта. */
  message: string | null;
  actionLabel: string;
  onAction: () => void;
};
