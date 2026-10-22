export type HpBarProps = {
  current: number;
  max: number;
  color: string;
  /** Высота полоски: 8 (компактная) или 10 (по умолчанию) */
  height?: 8 | 10;
};
