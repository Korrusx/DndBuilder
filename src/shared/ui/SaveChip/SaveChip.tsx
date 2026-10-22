import { Pressable } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './SaveChip.styles';
import type { SaveChipProps } from './SaveChip.types';

/** Кнопка-пилюля спасброска: фон accentBg и текст accent при владении. */
export function SaveChip({ label, proficient, onPress, style, textStyle }: SaveChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, proficient && styles.chipProficient, style]}
    >
      <AppText style={[styles.text, proficient && styles.textProficient, textStyle]}>
        {label}
        {proficient ? ' ●' : ''}
      </AppText>
    </Pressable>
  );
}
