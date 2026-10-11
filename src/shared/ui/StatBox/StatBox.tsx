import { colors } from '@/shared/config/theme';
import { Pressable } from 'react-native';
import { AppText } from '../AppText/AppText';
import { styles } from './StatBox.styles';

/** Плитка с числом: КЗ, инициатива, скорость… Нажатие — бросок или подробности. */
export function StatBox({ label, value, onPress, accent }: { label: string; value: string; onPress?: () => void; accent?: boolean }) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.stat, pressed && { opacity: 0.8 }]}
    >
      <AppText style={[styles.statValue, accent && { color: colors.accent }]}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </Pressable>
  );
}
