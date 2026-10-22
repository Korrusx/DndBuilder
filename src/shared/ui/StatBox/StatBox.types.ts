import type { StyleProp, ViewStyle } from 'react-native';

export type StatBoxProps = {
  label: string;
  value: string;
  onPress?: () => void;
  accent?: boolean;
  note?: string;
  style?: StyleProp<ViewStyle>;
};
