import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/shared/config';

import { styles } from './ClassSheet.styles';
import type { ClassRowProps } from './ClassRow.types';

/** Строка класса в шторке: название и пояснение; недоступный — серым, с причиной. */
export function ClassRow({ name, note, selected, disabled, onPress }: ClassRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${name}, ${note}`}
      disabled={disabled}
      onPress={onPress}
      style={[styles.row, selected && styles.rowOn, disabled && styles.rowOff]}
    >
      <View style={styles.lines}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.note}>{note}</Text>
      </View>
      {selected ? <Feather name="check" size={18} color={colors.accent} /> : null}
    </Pressable>
  );
}
