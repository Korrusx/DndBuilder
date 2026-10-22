import { Pressable, Text } from 'react-native';

import { styles } from './Button.styles';
import type { ButtonProps } from './Button.types';

export function Button({ title, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : variant === 'danger' ? styles.danger : styles.secondary,
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}
    >
      <Text style={[styles.label, primary ? styles.labelPrimary : variant === 'danger' ? styles.labelDanger : styles.labelDefault]}>{title}</Text>
    </Pressable>
  );
}
