import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type FlipCardProps = {
  revealed: boolean;
  /** С анимацией переворота (иначе сразу лицом). */
  animate: boolean;
  back: ReactNode;
  front: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};
