import { Pressable, View } from 'react-native';

import { byId } from '@/shared/content';
import { AppText } from '@/shared/ui';

import { bonusText, shortSubspeciesName, subspeciesSummary } from '../../lib/subspeciesText';
import { styles } from './SubspeciesPanel.styles';
import type { SubspeciesPanelProps } from './SubspeciesPanel.types';

/** Разновидности вида (эльфийские родословные, предки драконорождённых, облики шифтера…) прямо под карточкой вида. */
export function SubspeciesPanel({ species, selectedId, onSelect, hint }: SubspeciesPanelProps) {
  return (
    <View style={styles.panel}>
      <AppText variant="secondary" style={styles.hint}>
        {hint}
      </AppText>
      {species.subspecies.flatMap((id) => {
        const sub = byId.subspecies.get(id);
        if (!sub) {
          return [];
        }
        const selected = id === selectedId;
        const { traits, description } = subspeciesSummary(sub);
        const bonuses = bonusText(sub.abilityBonuses);
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
              <AppText style={styles.name}>{shortSubspeciesName(id)}</AppText>
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
