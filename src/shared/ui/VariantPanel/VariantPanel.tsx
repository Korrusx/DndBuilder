import { Pressable, View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './VariantPanel.styles';
import type { VariantPanelProps } from './VariantPanel.types';

/** Разновидности под плиткой (подрасы, подклассы 1-го уровня, предки драконорождённых…) — одна на выбор. */
export function VariantPanel({ options, selectedId, onSelect, hint }: VariantPanelProps) {
  return (
    <View style={styles.panel}>
      <AppText variant="secondary" style={styles.hint}>
        {hint}
      </AppText>
      {options.map(({ id, name, bonuses, traits, description }) => {
        const selected = id === selectedId;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(id)}
            style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
            <View style={styles.text}>
              <AppText style={styles.name}>{name}</AppText>
              {bonuses ? <AppText variant="secondary">{bonuses}</AppText> : null}
              {traits ? <AppText variant="secondary">{traits}</AppText> : null}
              {description ? (
                <AppText variant="secondary" numberOfLines={2}>
                  {description}
                </AppText>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
