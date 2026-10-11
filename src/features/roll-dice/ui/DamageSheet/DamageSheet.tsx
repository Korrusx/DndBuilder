import { rollDamage } from '@/entities/character/model/play';
import type { DamageRoll } from '@/entities/character/model/types';
import { formatDice, formatModifier } from '@/shared/lib/dice/dice';
import { AppText } from '@/shared/ui/AppText/AppText';
import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';
import { Button } from '@/shared/ui/Button/Button';
import { Segmented } from '@/shared/ui/Segmented/Segmented';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { DamageRequest } from '../../model/types';
import { Die } from '../Die/Die';
import { styles } from './DamageSheet.styles';

export function DamageSheet({ request, onClose }: { request: DamageRequest | null; onClose: () => void }) {
  const [critical, setCritical] = useState(false);
  const [roll, setRoll] = useState<DamageRoll | null>(null);

  const doRoll = (crit: boolean) => request && setRoll(rollDamage(request.dice, request.bonus, crit));

  useEffect(() => {
    if (!request) return;
    setCritical(false);
    doRoll(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return (
    <BottomSheet visible={!!request} title={request?.title} onClose={onClose}>
      {request ? (
        <AppText variant="secondary">
          {formatDice(request.dice)}
          {request.bonus ? ` ${formatModifier(request.bonus)}` : ''}
          {request.damageType ? ` · ${request.damageType}` : ''}
        </AppText>
      ) : null}
      <Segmented<'normal' | 'crit'>
        value={critical ? 'crit' : 'normal'}
        onChange={(v) => {
          setCritical(v === 'crit');
          doRoll(v === 'crit');
        }}
        options={[
          { value: 'normal', label: 'Обычный' },
          { value: 'crit', label: 'Критический' },
        ]}
      />
      {roll ? (
        <View style={styles.result}>
          <View style={styles.diceRow}>
            {roll.dice.map((d, i) => (
              <Die key={i} value={d} />
            ))}
          </View>
          <AppText style={styles.total}>{roll.total}</AppText>
        </View>
      ) : null}
      <View style={styles.buttons}>
        <View style={{ flex: 1 }}>
          <Button title="Бросить ещё" variant="secondary" onPress={() => doRoll(critical)} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Готово" onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}
