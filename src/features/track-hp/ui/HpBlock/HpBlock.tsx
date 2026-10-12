import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { applyDamage, applyHealing, deathStatus, HP_COLORS, hpLevel, setTempHp } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { colors, fonts } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { formatDie } from '@/shared/lib/dice';
import { AppText, Card, Dots, SmallButton } from '@/shared/ui';

import { styles } from './HpBlock.styles';
import type { HpBlockProps } from './HpBlock.types';

export function HpBlock({ c, sheet, onDeathSave }: HpBlockProps) {
  const { updateState } = usePlay();
  const { t } = useTranslation();
  const [amountText, setAmountText] = useState('1');
  const amount = Math.max(0, parseInt(amountText, 10) || 0);
  const { currentHp, tempHp } = c.state;
  const color = HP_COLORS[hpLevel(currentHp, sheet.maxHp)];
  const status = deathStatus(c.state);
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
            <AppText style={[styles.hpMax, { color: colors.info }]}>+{tempHp}</AppText>
            <AppText style={styles.tempLabel}>{t('hp.temp')}</AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${sheet.maxHp ? (currentHp / sheet.maxHp) * 100 : 0}%`, backgroundColor: color }]} />
      </View>

      <View style={styles.row}>
        <SmallButton title={t('hp.damage')} tone="damage" flex={1} disabled={!amount} onPress={() => updateState((s) => applyDamage(s, amount, sheet.maxHp))} />
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
        <SmallButton title={t('hp.heal')} tone="heal" flex={1} disabled={!amount} onPress={() => updateState((s) => applyHealing(s, amount, sheet.maxHp))} />
      </View>
      <View style={styles.row}>
        <SmallButton title={t('hp.setTemp', { amount })} tone="accent" flex={1} disabled={!amount} onPress={() => updateState((s) => setTempHp(s, amount))} />
        {tempHp ? <SmallButton title={t('hp.resetTemp')} flex={1} onPress={() => updateState((s) => ({ ...s, tempHp: 0 }))} /> : null}
      </View>

      <AppText variant="secondary">
        {t('hp.hitDice')}{' '}
        {sheet.hitDice.map((h) => t('hp.hitDiceItem', { left: h.total - (c.state.hitDiceSpent[h.classId] ?? 0), total: h.total, die: formatDie(h.die) })).join(', ')}
      </AppText>

      {status !== 'alive' ? (
        <View style={styles.death}>
          <AppText style={{ color: status === 'dead' ? colors.damage : colors.text, fontFamily: fonts.textBold }}>
            {status === 'dead' ? t('hp.dead') : status === 'stable' ? t('hp.stable') : t('hp.dying')}
          </AppText>
          <View style={styles.row}>
            <AppText variant="secondary" style={styles.width72}>
              {t('hp.successes')}
            </AppText>
            <Dots total={3} filled={c.state.deathSaves.successes} color={colors.heal} />
          </View>
          <View style={styles.row}>
            <AppText variant="secondary" style={styles.width72}>
              {t('hp.failures')}
            </AppText>
            <Dots total={3} filled={c.state.deathSaves.failures} color={colors.damage} />
          </View>
          {status === 'dying' ? <SmallButton title={t('hp.rollDeathSave')} tone="accent" onPress={onDeathSave} /> : null}
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
