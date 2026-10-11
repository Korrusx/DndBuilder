import { AppText } from '@/shared/ui/AppText/AppText';
import { View } from 'react-native';
import { styles } from './Die.styles';

export function Die({ value, dropped }: { value: number; dropped?: boolean }) {
  return (
    <View style={[styles.die, dropped && styles.dieDropped]}>
      <AppText style={[styles.dieValue, dropped && styles.dieValueDropped]}>{value}</AppText>
    </View>
  );
}
