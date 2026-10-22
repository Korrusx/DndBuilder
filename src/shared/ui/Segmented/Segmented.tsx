import { Pressable, View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './Segmented.styles';
import type { SegmentedProps } from './Segmented.types';

/** Переключатель из нескольких вариантов. variant="soft" — без рамки, фон surface2, акцент мягкий. */
export function Segmented<T extends string>({ options, value, onChange, variant = 'default' }: SegmentedProps<T>) {
  const soft = variant === 'soft';
  return (
    <View style={soft ? styles.softRow : styles.segmented}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(option.value)}
            style={
              soft ? [styles.softItem, on && styles.softItemOn] : [styles.segmentedItem, on && styles.segmentedItemOn]
            }
          >
            <AppText
              style={
                soft
                  ? [styles.softLabel, on && styles.softLabelOn]
                  : [styles.segmentedLabel, on && styles.segmentedLabelOn]
              }
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
