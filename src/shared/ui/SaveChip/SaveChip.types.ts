import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type SaveChipProps = {
  label: string;
  proficient: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};
