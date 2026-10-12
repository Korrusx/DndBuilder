import { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { DamageRoll } from '@/entities/character';
import { rollDamage } from '@/entities/character';
import { useTranslation } from '@/shared/i18n';
import { formatDice, formatModifier } from '@/shared/lib/dice';
import { AppText, BottomSheet, Button, Chip, ChipRow, Segmented } from '@/shared/ui';

import { Die } from '../Die/Die';
import { styles } from './DamageSheet.styles';
import type { DamageSheetProps } from './DamageSheet.types';

export function DamageSheet({ request, onClose }: DamageSheetProps) {
  const { t } = useTranslation();
  const [critical, setCritical] = useState(false);
  const [roll, setRoll] = useState<DamageRoll | null>(null);
  const [variant, setVariant] = useState(0);
  const dice = request?.variants?.[variant]?.dice ?? request?.dice ?? '';
  const bonus = request?.variants?.[variant]?.bonus ?? request?.bonus ?? 0;

  const doRoll = (crit: boolean, d = dice, b = bonus) => request && setRoll(rollDamage(d, b, crit, Math.random, request.minDie));

  useEffect(() => {
    if (!request) return;
    setCritical(false);
    setVariant(0);
    doRoll(false, request.variants?.[0]?.dice ?? request.dice, request.variants?.[0]?.bonus ?? request.bonus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return (
    <BottomSheet visible={!!request} title={request?.title} onClose={onClose}>
      {request ? (
        <AppText variant="secondary">
          {formatDice(dice)}
          {bonus ? ` ${formatModifier(bonus)}` : ''}
          {request.damageType ? ` · ${request.damageType}` : ''}
        </AppText>
      ) : null}
      {request?.minDie ? <AppText variant="secondary">{t('roll.greatWeapon', { min: request.minDie })}</AppText> : null}
      {request?.note ? <AppText variant="secondary">{request.note}</AppText> : null}
      {request?.variants && request.variants.length > 1 ? (
        <ChipRow>
          {request.variants.map((v, i) => (
            <Chip
              key={v.label}
              label={v.label}
              selected={i === variant}
              onPress={() => {
                setVariant(i);
                doRoll(critical, v.dice, v.bonus ?? request.bonus);
              }}
            />
          ))}
        </ChipRow>
      ) : null}
      {request?.noCritical ? null : (
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
      )}
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
