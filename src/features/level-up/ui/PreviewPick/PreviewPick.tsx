import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/shared/config';

import { styles } from './PreviewPick.styles';
import type { PreviewPickProps } from './PreviewPick.types';

/** Выбор нескольких вариантов с примеркой «было → станет» справа (макет У4). */
export function PreviewPick({ options, selected, max, onChange }: PreviewPickProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else if (max === 1) {
      onChange([id]);
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  };
  return (
    <View style={styles.list}>
      {options.map((option) => {
        const on = selected.includes(option.id);
        const full = !on && max > 1 && selected.length >= max;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on, disabled: option.disabled || full }}
            disabled={option.disabled || full}
            onPress={() => toggle(option.id)}
            style={[styles.row, on && styles.rowOn, (option.disabled || full) && styles.rowOff]}
          >
            <View style={[styles.tick, on && styles.tickOn]}>
              {on ? <Feather name="check" size={16} color={colors.onAccent} /> : null}
            </View>
            <View style={styles.text}>
              <Text style={styles.title}>{option.title}</Text>
              {option.hint ? <Text style={styles.hint}>{option.hint}</Text> : null}
            </View>
            {option.after ? (
              <>
                {option.before ? <Text style={styles.before}>{option.before}</Text> : null}
                {option.before ? <Feather name="arrow-right" size={14} color="#6B737D" /> : null}
                <Text style={[styles.after, on && styles.afterOn]}>{option.after}</Text>
              </>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
