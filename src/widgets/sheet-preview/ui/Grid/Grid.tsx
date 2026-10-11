import { View } from 'react-native';
import { styles } from './Grid.styles';
import type { GridProps } from './Grid.types';

export function Grid({ children }: GridProps) {
  return <View style={styles.grid}>{children}</View>;
}
