import { View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './Pill.styles';
import type { PillProps } from './Pill.types';

/** Небольшая метка-факт (кость хитов, скорость, доспехи) — не нажимается. */
export function Pill({ label, accent }: PillProps) {
  return (
    <View style={[styles.pill, accent && styles.pillAccent]}>
      <AppText style={[styles.label, accent && styles.labelAccent]}>{label}</AppText>
    </View>
  );
}
