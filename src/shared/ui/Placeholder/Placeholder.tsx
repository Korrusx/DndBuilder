import { View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './Placeholder.styles';
import type { PlaceholderProps } from './Placeholder.types';

/** Временная заглушка для экранов, которые ещё не сделаны. */
export function Placeholder({ title, note }: PlaceholderProps) {
  return (
    <View style={styles.card}>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="secondary">{note}</AppText>
    </View>
  );
}
