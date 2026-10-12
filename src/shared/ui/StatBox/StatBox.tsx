import { Pressable } from 'react-native';

import { colors } from '@/shared/config';

import { AppText } from '../AppText/AppText';
import { styles } from './StatBox.styles';
import type { StatBoxProps } from './StatBox.types';

/** Плитка с числом: КЗ, инициатива, скорость… Нажатие — бросок или подробности. */
export function StatBox({ label, value, onPress, accent }: StatBoxProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.stat, pressed && { opacity: 0.8 }]}
    >
      <AppText style={[styles.statValue, accent && { color: colors.accent }]}>{value}</AppText>
      <AppText style={styles.statLabel} numberOfLines={2}>
        {label}
      </AppText>
    </Pressable>
  );
}
