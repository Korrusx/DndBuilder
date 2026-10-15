import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import type { D20Mode, D20Roll } from '@/shared/lib/dice';
import { formatModifier, rollD20 } from '@/shared/lib/dice';
import { secureRandom } from '@/shared/lib/random';
import { AppText, BottomSheet, Button, Segmented } from '@/shared/ui';

import type { DiceOutcome } from '../../model/types';
import { useDiceReveal } from '../../model/useDiceReveal';
import { DiceTable } from '../DiceTable/DiceTable';
import { Die } from '../Die/Die';
import { styles } from './D20Sheet.styles';
import type { D20SheetProps } from './D20Sheet.types';

/** Отклик телефона на итог: естественные 20 и 1 ощущаются иначе, чем обычный бросок. */
function feel(natural: number) {
  const p =
    natural === 20
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : natural === 1
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  p.catch(() => undefined);
}

const outcome = (r: D20Roll): DiceOutcome => (r.natural === 20 ? 'crit' : r.natural === 1 ? 'fumble' : null);

export function D20Sheet({ request, onClose }: D20SheetProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<D20Mode>('normal');
  const { settings, use3d, roll, landed, show, onLanded, onError } = useDiceReveal<D20Roll>((r) => feel(r.natural), outcome);
  const modifier = request?.parts.reduce((s, p) => s + p.value, 0) ?? 0;

  const fixed = !!request?.roll;
  const doRoll = (m: D20Mode) => show(rollD20(modifier, m, secureRandom));

  useEffect(() => {
    if (!request) return;
    const m = request.mode ?? 'normal';
    setMode(m);
    if (request.roll) show(request.roll);
    else doRoll(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  return (
    <BottomSheet visible={!!request} title={request?.title} onClose={onClose}>
      <AppText variant="secondary">
        {request?.parts.length
          ? request.parts.map((p) => `${p.label} ${formatModifier(p.value)}`).join(' · ')
          : t('roll.noModifiers')}
        {'  '}= {t('roll.d20')} {formatModifier(modifier)}
      </AppText>
      {fixed ? null : (
        <Segmented<D20Mode>
          value={mode}
          onChange={(m) => {
            setMode(m);
            doRoll(m);
          }}
          options={[
            { value: 'disadvantage', label: t('roll.disadvantage') },
            { value: 'normal', label: t('roll.normal') },
            { value: 'advantage', label: t('roll.advantage') },
          ]}
        />
      )}
      {use3d && request ? (
        <DiceTable
          roll={roll ? { id: roll.id, dice: roll.dice, sides: 20, keep: roll.keptIndex } : null}
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
                <Die key={i} value={d} dropped={i !== roll.keptIndex} />
              ))}
            </View>
            <AppText style={styles.total}>{roll.total}</AppText>
            <AppText style={[styles.nat, { color: roll.natural === 20 ? colors.heal : colors.damage }]}>
              {roll.natural === 20 ? t('roll.nat20') : roll.natural === 1 ? t('roll.nat1') : ' '}
            </AppText>
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
        {fixed ? null : (
          <Button title={t('common.rollAgain')} variant="secondary" onPress={() => doRoll(mode)} style={styles.fill} />
        )}
        <Button title={t('common.done')} onPress={onClose} style={styles.fill} />
      </View>
    </BottomSheet>
  );
}
