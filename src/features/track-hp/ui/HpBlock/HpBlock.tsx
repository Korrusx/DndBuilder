import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { applyDamage, applyHealing, deathStatus, HP_COLORS, hpLevel, setTempHp } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { formatDie } from '@/shared/lib/dice';
import { AppText, Card, DotRow, HpBar, SmallButton } from '@/shared/ui';

import { styles } from './HpBlock.styles';
import type { HpBlockProps } from './HpBlock.types';

export function HpBlock({ character, sheet, onDeathSave }: HpBlockProps) {
  const { updateState } = usePlay();
  const { t } = useTranslation();
  const [amountText, setAmountText] = useState('1');
  const amount = Math.max(0, parseInt(amountText, 10) || 0);
  const { currentHp, tempHp } = character.state;
  const color = HP_COLORS[hpLevel(currentHp, sheet.maxHp)];
  const status = deathStatus(character.state);
  const setAmount = (n: number) => setAmountText(String(Math.max(0, n)));

  return (
    <Card>
      <View style={styles.hpTop}>
        <View style={styles.fill2}>
          <AppText variant="secondary">{t('hp.title')}</AppText>
          <AppText style={[styles.hpValue, { color }]}>
            {currentHp}
            <AppText style={styles.hpMax}> / {sheet.maxHp}</AppText>
          </AppText>
        </View>
        {tempHp > 0 ? (
          <View style={styles.temp}>
            <AppText style={[styles.hpMax, styles.hpMaxTemp]}>+{tempHp}</AppText>
            <AppText style={styles.tempLabel}>{t('hp.temp')}</AppText>
          </View>
        ) : null}
      </View>
      <HpBar current={currentHp} max={sheet.maxHp} color={color} />

      <View style={styles.row}>
        <SmallButton
          title={t('hp.damage')}
          tone="damage"
          flex={1}
          disabled={!amount}
          onPress={() => updateState((s) => applyDamage(s, amount, sheet.maxHp))}
        />
        <View style={styles.amount}>
          <Pressable onPress={() => setAmount(amount - 1)} hitSlop={8} style={styles.amountBtn}>
            <AppText style={styles.amountSign}>−</AppText>
          </Pressable>
          <TextInput
            value={amountText}
            onChangeText={(t) => setAmountText(t.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            selectTextOnFocus
            style={styles.amountInput}
          />
          <Pressable onPress={() => setAmount(amount + 1)} hitSlop={8} style={styles.amountBtn}>
            <AppText style={styles.amountSign}>+</AppText>
          </Pressable>
        </View>
        <SmallButton
          title={t('hp.heal')}
          tone="heal"
          flex={1}
          disabled={!amount}
          onPress={() => updateState((s) => applyHealing(s, amount, sheet.maxHp))}
        />
      </View>
      <View style={styles.row}>
        <SmallButton
          title={t('hp.setTemp', { amount })}
          tone="accent"
          flex={1}
          disabled={!amount}
          onPress={() => updateState((s) => setTempHp(s, amount))}
        />
        {tempHp ? (
          <SmallButton title={t('hp.resetTemp')} flex={1} onPress={() => updateState((s) => ({ ...s, tempHp: 0 }))} />
        ) : null}
      </View>

      <AppText variant="secondary">
        {t('hp.hitDice')}{' '}
        {sheet.hitDice
          .map((h) =>
            t('hp.hitDiceItem', {
              left: h.total - (character.state.hitDiceSpent[h.classId] ?? 0),
              total: h.total,
              die: formatDie(h.die),
            }),
          )
          .join(', ')}
      </AppText>

      {status !== 'alive' ? (
        <View style={styles.death}>
          <AppText style={[styles.statusText, status === 'dead' && styles.statusDead]}>
            {status === 'dead' ? t('hp.dead') : status === 'stable' ? t('hp.stable') : t('hp.dying')}
          </AppText>
          <DotRow
            label={t('hp.successes')}
            total={3}
            filled={character.state.deathSaves.successes}
            color={colors.heal}
            secondary
            onPress={(i) =>
              updateState((s) => ({
                ...s,
                deathSaves: {
                  ...s.deathSaves,
                  successes: i < s.deathSaves.successes ? i : i + 1,
                },
              }))
            }
          />
          <DotRow
            label={t('hp.failures')}
            total={3}
            filled={character.state.deathSaves.failures}
            color={colors.damage}
            secondary
            onPress={(i) =>
              updateState((s) => ({
                ...s,
                deathSaves: {
                  ...s.deathSaves,
                  failures: i < s.deathSaves.failures ? i : i + 1,
                },
              }))
            }
          />
          {status === 'dying' ? (
            <SmallButton title={t('hp.rollDeathSave')} tone="accent" onPress={onDeathSave} />
          ) : null}
          {status === 'dead' ? (
            <SmallButton
              title={t('hp.revive')}
              onPress={() => updateState((s) => ({ ...s, currentHp: 1, deathSaves: { successes: 0, failures: 0 } }))}
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
