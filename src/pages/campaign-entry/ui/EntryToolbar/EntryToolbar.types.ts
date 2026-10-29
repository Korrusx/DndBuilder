export type EntryToolbarProps = {
  onMention: () => void;
  onPhoto: () => void;
  secret: boolean;
  onToggleSecret: () => void;
  /** «черновик сохранён» и т.п. */
  status: string;
};
