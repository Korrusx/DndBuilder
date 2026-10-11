import { colors } from '@/shared/config';
import { Pressable, View } from 'react-native';
import { AppText } from '../AppText/AppText';
import { styles } from './Segmented.styles';

/** Переключатель из нескольких вариантов («Стандартный / Покупка очков / Броски»). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentedItem, on && { backgroundColor: colors.accent }]}
          >
            <AppText style={[styles.segmentedLabel, on && { color: colors.onAccent }]}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
