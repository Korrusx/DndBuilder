import type { Character, CharacterSheet } from '@/entities/character';
import { applyDamage, applyHealing, deathStatus, HP_COLORS, hpLevel, setTempHp } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { colors, fonts } from '@/shared/config';
import { AppText, Card, Dots, SmallButton } from '@/shared/ui';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { styles } from './HpBlock.styles';

export function HpBlock({ c, sheet, onDeathSave }: { c: Character; sheet: CharacterSheet; onDeathSave: () => void }) {
  const { updateState } = usePlay();
  const [amountText, setAmountText] = useState('1');
  const amount = Math.max(0, parseInt(amountText, 10) || 0);
  const { currentHp, tempHp } = c.state;
  const color = HP_COLORS[hpLevel(currentHp, sheet.maxHp)];
  const status = deathStatus(c.state);
  const setAmount = (n: number) => setAmountText(String(Math.max(0, n)));

  return (
    <Card>
      <View style={styles.hpTop}>
        <View style={{ flex: 1 }}>
          <AppText variant="secondary">Хиты</AppText>
          <AppText style={[styles.hpValue, { color }]}>
            {currentHp}
            <AppText style={styles.hpMax}> / {sheet.maxHp}</AppText>
          </AppText>
        </View>
        {tempHp > 0 ? (
          <View style={styles.temp}>
            <AppText style={[styles.hpMax, { color: colors.info }]}>+{tempHp}</AppText>
            <AppText style={{ fontSize: 12, color: colors.info }}>врем.</AppText>
          </View>
        ) : null}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${sheet.maxHp ? (currentHp / sheet.maxHp) * 100 : 0}%`, backgroundColor: color }]} />
      </View>

      <View style={styles.row}>
        <SmallButton title="− Урон" tone="damage" flex={1} disabled={!amount} onPress={() => updateState((s) => applyDamage(s, amount, sheet.maxHp))} />
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
        <SmallButton title="+ Лечение" tone="heal" flex={1} disabled={!amount} onPress={() => updateState((s) => applyHealing(s, amount, sheet.maxHp))} />
      </View>
      <View style={styles.row}>
        <SmallButton title={`Врем. хиты ${amount}`} tone="accent" flex={1} disabled={!amount} onPress={() => updateState((s) => setTempHp(s, amount))} />
        {tempHp ? <SmallButton title="Сбросить врем." flex={1} onPress={() => updateState((s) => ({ ...s, tempHp: 0 }))} /> : null}
      </View>

      <AppText variant="secondary">
        Кости хитов:{' '}
        {sheet.hitDice.map((h) => `${h.total - (c.state.hitDiceSpent[h.classId] ?? 0)} из ${h.total} (к${h.die})`).join(', ')}
      </AppText>

      {status !== 'alive' ? (
        <View style={styles.death}>
          <AppText style={{ color: status === 'dead' ? colors.damage : colors.text, fontFamily: fonts.textBold }}>
            {status === 'dead' ? 'Персонаж погиб' : status === 'stable' ? 'Стабилен (без сознания)' : 'При смерти — спасброски от смерти'}
          </AppText>
          <View style={styles.row}>
            <AppText variant="secondary" style={{ width: 72 }}>
              Успехи
            </AppText>
            <Dots total={3} filled={c.state.deathSaves.successes} color={colors.heal} />
          </View>
          <View style={styles.row}>
            <AppText variant="secondary" style={{ width: 72 }}>
              Провалы
            </AppText>
            <Dots total={3} filled={c.state.deathSaves.failures} color={colors.damage} />
          </View>
          {status === 'dying' ? <SmallButton title="Бросить спасбросок от смерти" tone="accent" onPress={onDeathSave} /> : null}
          {status === 'dead' ? (
            <SmallButton
              title="Сбросить (воскрешение)"
              onPress={() => updateState((s) => ({ ...s, currentHp: 1, deathSaves: { successes: 0, failures: 0 } }))}
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
