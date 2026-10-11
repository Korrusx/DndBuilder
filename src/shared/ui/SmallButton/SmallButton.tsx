import { colors } from '@/shared/config';
import { Pressable } from 'react-native';
import { AppText } from '../AppText/AppText';
import { styles } from './SmallButton.styles';

/** Небольшая кнопка (44 px) с цветом урона/лечения/акцента. */
export function SmallButton({
  title,
  onPress,
  tone = 'neutral',
  disabled,
  flex,
}: {
  title: string;
  onPress: () => void;
  tone?: 'neutral' | 'damage' | 'heal' | 'accent';
  disabled?: boolean;
  flex?: number;
}) {
  const palette = {
    neutral: { bg: colors.surface2, fg: colors.text },
    damage: { bg: colors.damageBg, fg: colors.damage },
    heal: { bg: colors.healBg, fg: colors.heal },
    accent: { bg: colors.accentBg, fg: colors.accent },
  }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.small,
        { backgroundColor: palette.bg, flex },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
      ]}
    >
      <AppText style={[styles.smallLabel, { color: palette.fg }]}>{title}</AppText>
    </Pressable>
  );
}
