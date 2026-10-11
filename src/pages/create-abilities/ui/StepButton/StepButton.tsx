import { AppText } from '@/shared/ui/AppText/AppText';
import { Pressable } from 'react-native';
import { styles } from './StepButton.styles';

export function StepButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
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
