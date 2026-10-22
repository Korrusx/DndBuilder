import { View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { Dots } from '../Dots/Dots';
import { styles } from './DotRow.styles';
import type { DotRowProps } from './DotRow.types';

/** Строка «лейбл + кружки»: ячейки заклинаний, спасброски от смерти. */
export function DotRow({ label, total, filled, onPress, color, labelWidth = 72, secondary = false }: DotRowProps) {
  return (
    <View style={styles.row}>
      <AppText variant={secondary ? 'secondary' : undefined} style={{ width: labelWidth }}>
        {label}
      </AppText>
      <Dots total={total} filled={filled} color={color} onPress={onPress} />
    </View>
  );
}
