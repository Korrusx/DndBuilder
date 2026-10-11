import { colors } from '@/shared/config';
import type { D20Mode, D20Roll } from '@/shared/lib/dice';
import { formatModifier, rollD20 } from '@/shared/lib/dice';
import { AppText, BottomSheet, Button, Segmented } from '@/shared/ui';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Die } from '../Die/Die';
import { styles } from './D20Sheet.styles';
import type { D20SheetProps } from './D20Sheet.types';

export function D20Sheet({ request, onClose }: D20SheetProps) {
  const [mode, setMode] = useState<D20Mode>('normal');
  const [roll, setRoll] = useState<D20Roll | null>(null);
  const modifier = request?.parts.reduce((s, p) => s + p.value, 0) ?? 0;

  const fixed = !!request?.roll;
  const doRoll = (m: D20Mode) => setRoll(rollD20(modifier, m));

  useEffect(() => {
    if (!request) return;
    const m = request.mode ?? 'normal';
    setMode(m);
    if (request.roll) setRoll(request.roll);
    else doRoll(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return (
    <BottomSheet visible={!!request} title={request?.title} onClose={onClose}>
      <AppText variant="secondary">
        {request?.parts.length
          ? request.parts.map((p) => `${p.label} ${formatModifier(p.value)}`).join(' · ')
          : 'Без модификаторов'}
        {'  '}= к20 {formatModifier(modifier)}
      </AppText>
      {fixed ? null : (
        <Segmented<D20Mode>
          value={mode}
          onChange={(m) => {
            setMode(m);
            doRoll(m);
          }}
          options={[
            { value: 'disadvantage', label: 'Помеха' },
            { value: 'normal', label: 'Обычный' },
            { value: 'advantage', label: 'Преимущество' },
          ]}
        />
      )}
      {roll ? (
        <View style={styles.result}>
          <View style={styles.diceRow}>
            {roll.dice.map((d, i) => (
              <Die key={i} value={d} dropped={i !== roll.keptIndex} />
            ))}
          </View>
          <AppText style={styles.total}>{roll.total}</AppText>
          {roll.natural === 20 ? <AppText style={[styles.nat, { color: colors.heal }]}>Естественная 20!</AppText> : null}
          {roll.natural === 1 ? <AppText style={[styles.nat, { color: colors.damage }]}>Естественная 1</AppText> : null}
        </View>
      ) : null}
      <View style={styles.buttons}>
        {fixed ? null : (
          <View style={{ flex: 1 }}>
            <Button title="Бросить ещё" variant="secondary" onPress={() => doRoll(mode)} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Button title="Готово" onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}
