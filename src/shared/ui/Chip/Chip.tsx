import { Pressable } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './Chip.styles';
import type { ChipProps } from './Chip.types';

export function Chip({ label, selected, disabled, note, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        disabled && !selected && { opacity: 0.4 },
        pressed && { opacity: 0.8 },
      ]}
    >
      <AppText style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</AppText>
      {note ? <AppText style={styles.chipNote}>{note}</AppText> : null}
    </Pressable>
  );
}
