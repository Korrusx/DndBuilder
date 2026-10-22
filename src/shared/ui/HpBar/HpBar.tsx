import { View } from 'react-native';

import { styles } from './HpBar.styles';
import type { HpBarProps } from './HpBar.types';

/** Полоска хитов с динамической шириной и цветом. */
export function HpBar({ current, max, color, height = 10 }: HpBarProps) {
  const radius = height / 2;
  const pct = max > 0 ? (current / max) * 100 : 0;
  return (
    <View style={[styles.track, { height, borderRadius: radius }]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color, borderRadius: radius }]} />
    </View>
  );
}
