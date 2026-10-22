export type DotRowProps = {
  label: string;
  total: number;
  filled: number;
  onPress?: (index: number) => void;
  color?: string;
  /** Ширина лейбла, по умолчанию 72 */
  labelWidth?: number;
  /** Вторичный цвет текста лейбла */
  secondary?: boolean;
};
