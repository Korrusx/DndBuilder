import { ABILITY_IDS } from '@/entities/character';
import { spacing } from '@/shared/config';
import type { AbilityId } from '@/shared/content';
import { abilityAbbr } from '@/shared/content';
import { Chip, ChipRow, Segmented } from '@/shared/ui';
import { useState } from 'react';
import { View } from 'react-native';
import type { AsiPickerProps } from './AsiPicker.types';

/** «Увеличение характеристик»: +2 к одной или +1 к двум, не выше 20. */
export function AsiPicker({
  increases,
  scores,
  onChange,
}: AsiPickerProps) {
  const mode: 'two' | 'split' = Object.values(increases).some((v) => v === 2) || Object.keys(increases).length === 0 ? 'two' : 'split';
  const [current, setCurrent] = useState<'two' | 'split'>(mode);
  const picked = ABILITY_IDS.filter((id) => (increases[id] ?? 0) > 0);

  const tap = (id: AbilityId) => {
    if (current === 'two') return onChange({ [id]: 2 });
    const next = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id].slice(-2);
    onChange(Object.fromEntries(next.map((x) => [x, 1])));
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <Segmented<'two' | 'split'>
        value={current}
        onChange={(m) => {
          setCurrent(m);
          onChange({});
        }}
        options={[
          { value: 'two', label: '+2 к одной' },
          { value: 'split', label: '+1 к двум' },
        ]}
      />
      <ChipRow>
        {ABILITY_IDS.map((id) => {
          const add = current === 'two' ? 2 : 1;
          return (
            <Chip
              key={id}
              label={`${abilityAbbr(id)} ${scores[id]} → ${Math.min(20, scores[id] + add)}`}
              selected={picked.includes(id)}
              disabled={scores[id] >= 20}
              onPress={() => tap(id)}
            />
          );
        })}
      </ChipRow>
    </View>
  );
}
