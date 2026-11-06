import type { ViewStyle } from 'react-native';

export type CardSparkProps = {
  /** Когда появиться, мс от открытия экрана. */
  delay: number;
  color: string;
  size: number;
  diamond: boolean;
  position: Pick<ViewStyle, 'left' | 'right' | 'top'>;
};
