import { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { DamageRoll } from '@/entities/character';
import { rollDamage } from '@/entities/character';
import { useTranslation } from '@/shared/i18n';
import { formatDice, formatModifier } from '@/shared/lib/dice';
import { AppText, BottomSheet, Button, Segmented } from '@/shared/ui';

import { Die } from '../Die/Die';
import { styles } from './DamageSheet.styles';
import type { DamageSheetProps } from './DamageSheet.types';

export function DamageSheet({ request, onClose }: DamageSheetProps) {
  const { t } = useTranslation();
  const [critical, setCritical] = useState(false);
  const [roll, setRoll] = useState<DamageRoll | null>(null);

  const doRoll = (crit: boolean) => request && setRoll(rollDamage(request.dice, request.bonus, crit, Math.random, request.minDie));

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
      {request?.minDie ? <AppText variant="secondary">{t('roll.greatWeapon', { min: request.minDie })}</AppText> : null}
      <Segmented<'normal' | 'crit'>
        value={critical ? 'crit' : 'normal'}
        onChange={(v) => {
          setCritical(v === 'crit');
          doRoll(v === 'crit');
        }}
        options={[
          { value: 'normal', label: t('roll.normal') },
          { value: 'crit', label: t('roll.critical') },
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
        <View style={styles.fill}>
          <Button title={t('common.rollAgain')} variant="secondary" onPress={() => doRoll(critical)} />
        </View>
        <View style={styles.fill}>
          <Button title={t('common.done')} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}
