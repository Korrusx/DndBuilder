import { colors } from '@/shared/config';
import { Pressable, View } from 'react-native';
import { styles } from './Dots.styles';
import type { DotsProps } from './Dots.types';

/** Кружки: потраченные ячейки, спасброски от смерти. */
export function Dots({
  total,
  filled,
  color = colors.accent,
  onPress,
}: DotsProps) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, i) => (
        <Pressable
          key={i}
          disabled={!onPress}
          onPress={() => onPress?.(i)}
          hitSlop={6}
          style={[styles.dot, { borderColor: color }, i < filled && { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}
