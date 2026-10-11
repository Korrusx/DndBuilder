export type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  /** Небольшая подпись (например, «от предыстории»). */
  note?: string;
  onPress?: () => void;
};
