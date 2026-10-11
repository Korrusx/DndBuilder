import { View } from 'react-native';

import { styles } from './ChipRow.styles';
import type { ChipRowProps } from './ChipRow.types';

export function ChipRow({ children }: ChipRowProps) {
  return <View style={styles.chipRow}>{children}</View>;
}
