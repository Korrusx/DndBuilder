import { ReactNode } from 'react';
import { View } from 'react-native';
import { styles } from './ChipRow.styles';

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}
