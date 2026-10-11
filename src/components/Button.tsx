import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radius, sizes, spacing } from '@/theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', disabled }: Props) {
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

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.accent, minHeight: sizes.buttonPrimary },
  secondary: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: sizes.touchMin + 4,
  },
  danger: {
    backgroundColor: colors.damageBg,
    borderWidth: 1,
    borderColor: colors.damage,
    minHeight: sizes.touchMin + 4,
  },
  label: { fontFamily: fonts.textBold, fontSize: 16 },
});
