import { View } from 'react-native';
import { styles } from './Grid.styles';

export function Grid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}
