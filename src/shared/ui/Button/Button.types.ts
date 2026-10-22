import type { StyleProp, ViewStyle } from 'react-native';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  /** Например, `flex: 1` в ряду кнопок: кнопки делят ширину и тянутся до общей высоты. */
  style?: StyleProp<ViewStyle>;
};
