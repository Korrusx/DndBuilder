import { Pressable, Text } from 'react-native';

import { colors } from '@/shared/config';

import { styles } from './Button.styles';
import type { ButtonProps } from './Button.types';

export function Button({ title, onPress, variant = 'primary', disabled }: ButtonProps) {
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
      ]}
    >
      <Text style={[styles.label, { color: primary ? colors.onAccent : variant === 'danger' ? colors.damage : colors.text }]}>{title}</Text>
    </Pressable>
  );
}
