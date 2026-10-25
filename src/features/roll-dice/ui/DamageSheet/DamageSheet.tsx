import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { View } from 'react-native';

import type { DamageRoll } from '@/entities/character';
import { rollDamage } from '@/entities/character';
import { useTranslation } from '@/shared/i18n';
import { formatDice, formatModifier } from '@/shared/lib/dice';
import { secureRandom } from '@/shared/lib/random';
import { useResetState } from '@/shared/lib/reset-state';
import { AppText, BottomSheet, Button, Chip, ChipRow, Segmented } from '@/shared/ui';

import { DICE_3D_MAX, DICE_3D_SIDES } from '../../config/diceSettings';
import { useDiceReveal } from '../../model/useDiceReveal';
import { DiceTable } from '../DiceTable/DiceTable';
import { Die } from '../Die/Die';
import { styles } from './DamageSheet.styles';
import type { DamageSheetProps } from './DamageSheet.types';

const feel = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);

export function DamageSheet({ request, onClose }: DamageSheetProps) {
  const { t } = useTranslation();
  const [critical, setCritical] = useResetState(false, request);
  const { settings, use3d, roll, landed, show, onLanded, onError } = useDiceReveal<DamageRoll>(feel);
  const [variant, setVariant] = useResetState(0, request);
  const dice = request?.variants?.[variant]?.dice ?? request?.dice ?? '';
  const bonus = request?.variants?.[variant]?.bonus ?? request?.bonus ?? 0;

  const criticalOptions = [
    { value: 'normal' as const, label: t('roll.normal') },
    { value: 'crit' as const, label: t('roll.critical') },
  ];

  const doRoll = (crit: boolean, d = dice, b = bonus) => {
    if (!request) {
      return;
    }
    const r = rollDamage(d, b, crit, secureRandom, request.minDie);
    show(r, DICE_3D_SIDES.includes(r.sides) && r.dice.length > 0 && r.dice.length <= DICE_3D_MAX);
  };

  useEffect(() => {
    if (!request) {
      return;
    }
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
          options={criticalOptions}
        />
      )}
      {use3d && request && roll?.on3d !== false ? (
        <DiceTable
          roll={roll ? { id: roll.id, dice: roll.dice, sides: roll.sides } : null}
          settings={settings}
          onLanded={onLanded}
          onError={onError}
        />
      ) : null}
      {roll ? (
        // Итог занимает место и во время броска (невидимый) — окно не меняет высоту
        <View style={styles.result}>
          <View style={[styles.resultBody, !landed && styles.hidden]} accessibilityElementsHidden={!landed}>
            <View style={styles.diceRow}>
              {roll.dice.map((d, i) => (
                <Die key={i} value={d} />
              ))}
            </View>
            <AppText style={styles.total}>{roll.total}</AppText>
          </View>
          {landed ? null : (
            <View style={styles.rolling}>
              <AppText variant="secondary">{t('roll.rolling')}</AppText>
              <AppText variant="secondary">{t('roll.tapToSkip')}</AppText>
            </View>
          )}
        </View>
      ) : null}
      <View style={styles.buttons}>
        <Button
          title={t('common.rollAgain')}
          variant="secondary"
          onPress={() => doRoll(critical)}
          style={styles.fill}
        />
        <Button title={t('common.done')} onPress={onClose} style={styles.fill} />
      </View>
    </BottomSheet>
  );
}
