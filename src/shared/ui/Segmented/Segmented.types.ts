export type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** 'default' — solid accent active, 'soft' — surface2 buttons + accentBg active */
  variant?: 'default' | 'soft';
};
