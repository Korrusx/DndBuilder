import { AppText } from '@/shared/ui';
import { Pressable } from 'react-native';
import { styles } from './StepButton.styles';
import type { StepButtonProps } from './StepButton.types';

export function StepButton({ label, disabled, onPress }: StepButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.stepButton, (disabled || pressed) && { opacity: disabled ? 0.3 : 0.7 }]}
    >
      <AppText style={styles.value}>{label}</AppText>
    </Pressable>
  );
}
