// Панели бросков: к20 (проверки, спасброски, атаки) и урон.

import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { rollD20, formatDice, formatModifier, type D20Mode, type D20Roll } from '@/shared/lib/dice/dice';
import { exhaustionPenalty, rollDamage, type DamageRoll } from '@/entities/character/model/play';
import { colors, fonts, spacing } from '@/shared/config/theme';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Button } from '@/shared/ui/Button/Button';
import { Segmented } from '@/shared/ui/_split/wizard-ui';
import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';

export type RollPart = { label: string; value: number };

/** Слагаемые броска к20 с учётом истощения. */
export function d20Parts(parts: RollPart[], exhaustion: number): RollPart[] {
  const all = parts.filter((p) => p.value !== 0);
  if (exhaustion > 0) all.push({ label: `Истощение ${exhaustion}`, value: exhaustionPenalty(exhaustion) });
  return all;
}

export type D20Request = {
  title: string;
  parts: RollPart[];
  mode?: D20Mode;
  /** Уже сделанный бросок (спасбросок от смерти): только показать, без переброса. */
  roll?: D20Roll;
};

export function D20Sheet({ request, onClose }: { request: D20Request | null; onClose: () => void }) {
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

export type DamageRequest = { title: string; dice: string; bonus: number; damageType?: string };

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

function Die({ value, dropped }: { value: number; dropped?: boolean }) {
  return (
    <View style={[styles.die, dropped && styles.dieDropped]}>
      <AppText style={[styles.dieValue, dropped && styles.dieValueDropped]}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  result: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  diceRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md },
  die: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.accentBg,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dieDropped: { backgroundColor: colors.surface2, borderColor: colors.border },
  dieValue: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.accent },
  dieValueDropped: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  total: { fontFamily: fonts.displayBold, fontSize: 56, lineHeight: 64, color: colors.text },
  nat: { fontFamily: fonts.textBold, fontSize: 16 },
  buttons: { flexDirection: 'row', gap: spacing.sm },
});
