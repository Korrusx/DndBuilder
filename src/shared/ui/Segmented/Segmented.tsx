import { Pressable, View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './Segmented.styles';
import type { SegmentedProps } from './Segmented.types';

/** Переключатель из нескольких вариантов («Стандартный / Покупка очков / Броски»). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
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
            style={[styles.segmentedItem, on && styles.segmentedItemOn]}
          >
            <AppText style={[styles.segmentedLabel, on && styles.segmentedLabelOn]}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
