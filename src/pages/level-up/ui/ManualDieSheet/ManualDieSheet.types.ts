export type ManualDieSheetProps = {
  visible: boolean;
  /** Граней у кости: числа от 1 до этого. */
  die: number;
  onPick: (value: number) => void;
  onClose: () => void;
};
