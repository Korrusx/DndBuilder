import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ABILITY_IDS, POINT_BUY_BUDGET, POINT_BUY_MAX, POINT_BUY_MIN, STANDARD_ARRAY } from '@/entities/character/config/constants';
import {
  abilityModifier,
  pointBuyCost,
  pointBuySpent,
  roll4d6DropLowest
} from '@/entities/character/model/abilities';
import { backgroundBonusPattern, draftIssues } from '@/entities/character/model/build';
import { finalAbilityScores } from '@/entities/character/model/sheet';
import type { AbilityMethod, AbilityRoll, AbilityScores, Character } from '@/entities/character/model/types';
import { useDraft } from '@/features/create-character/model/DraftContext';
import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { content } from '@/shared/content/content';
import { abilityAbbr, abilityName, nameOf } from '@/shared/content/names';
import type { AbilityId } from '@/shared/content/types';
import { formatModifier } from '@/shared/lib/dice/dice';
import { Chip, ChipRow, Hint, Section, Segmented, StepStatus, WizardScreen } from '@/shared/ui/_split/wizard-ui';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Button } from '@/shared/ui/Button/Button';

const EMPTY: AbilityScores = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
const ALL_EIGHT: AbilityScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };

/** Значения пула, ещё не назначенные характеристикам (с учётом повторов). */
function freeValues(pool: number[], base: AbilityScores): number[] {
  const free = [...pool];
  for (const id of ABILITY_IDS) {
    const i = free.indexOf(base[id]);
    if (base[id] && i >= 0) free.splice(i, 1);
  }
  return free.sort((a, b) => b - a);
}

export function CreateAbilitiesPage() {
  const { character: c, update } = useDraft();
  const [picked, setPicked] = useState<number | null>(null);
  const [lastRolls, setLastRolls] = useState<AbilityRoll[] | null>(null);
  const background = content.backgrounds.find((b) => b.id === c.backgroundId);
  const issues = draftIssues(c, content).filter((i) => i.step === 3);

  const pool: number[] = c.abilityMethod === 'standard' ? [...STANDARD_ARRAY] : c.abilityMethod === 'roll' ? (c.abilityRolls ?? []) : [];
  const free = freeValues(pool, c.baseAbilities);
  const totals = finalAbilityScores({ ...c, feats: [] });
  const spent = c.abilityMethod === 'pointBuy' ? pointBuySpent(c.baseAbilities) : undefined;

  const setBase = (fn: (b: AbilityScores) => AbilityScores) => update((d) => ({ ...d, baseAbilities: fn(d.baseAbilities) }));

  const changeMethod = (m: AbilityMethod) => {
    setPicked(null);
    update((d) => ({ ...d, abilityMethod: m, baseAbilities: m === 'pointBuy' ? ALL_EIGHT : EMPTY }));
  };

  const roll = () => {
    const rolls = ABILITY_IDS.map(() => roll4d6DropLowest());
    setLastRolls(rolls);
    setPicked(null);
    update((d) => ({ ...d, abilityRolls: rolls.map((r) => r.total), baseAbilities: EMPTY }));
  };

  const tapAbility = (id: AbilityId) => {
    if (c.abilityMethod === 'pointBuy') return;
    if (picked !== null) {
      setBase((b) => ({ ...b, [id]: free[picked] }));
      setPicked(null);
    } else if (c.baseAbilities[id]) {
      setBase((b) => ({ ...b, [id]: 0 }));
    }
  };

  const step = (id: AbilityId, delta: number) =>
    setBase((b) => ({ ...b, [id]: Math.min(POINT_BUY_MAX, Math.max(POINT_BUY_MIN, b[id] + delta)) }));

  const canIncrease = (id: AbilityId) => {
    const v = c.baseAbilities[id];
    if (v >= POINT_BUY_MAX) return false;
    const extra = (pointBuyCost(v + 1) ?? 99) - (pointBuyCost(v) ?? 0);
    return (spent ?? 0) + extra <= POINT_BUY_BUDGET;
  };

  return (
    <WizardScreen step={3} canContinue={issues.length === 0} summary={<StepStatus issues={issues} />}>
      <Segmented<AbilityMethod>
        value={c.abilityMethod}
        onChange={changeMethod}
        options={[
          { value: 'standard', label: 'Стандартный' },
          { value: 'pointBuy', label: 'Покупка очков' },
          { value: 'roll', label: 'Броски 4к6' },
        ]}
      />

      {c.abilityMethod === 'roll' ? (
        <View style={{ gap: spacing.sm }}>
          <Button title={c.abilityRolls?.length ? 'Перебросить все' : 'Бросить 4к6 шесть раз'} variant="secondary" onPress={roll} />
          {lastRolls ? (
            <AppText variant="secondary">
              {lastRolls.map((r) => r.dice.map((d, i) => (i === r.droppedIndex ? `(${d})` : String(d))).join(' ') + ` = ${r.total}`).join('\n')}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {c.abilityMethod === 'pointBuy' ? (
        <AppText variant="heading" style={{ color: (spent ?? 0) <= POINT_BUY_BUDGET ? colors.accent : colors.damage }}>
          Осталось очков: {POINT_BUY_BUDGET - (spent ?? 0)} из {POINT_BUY_BUDGET}
        </AppText>
      ) : pool.length ? (
        <Section title="Значения" hint={free.length ? 'Выберите значение, затем характеристику. Нажмите на назначенное, чтобы вернуть.' : undefined}>
          <ChipRow>
            {free.map((v, i) => (
              <Chip key={`${v}-${i}`} label={String(v)} selected={picked === i} onPress={() => setPicked(picked === i ? null : i)} />
            ))}
            {free.length === 0 ? <AppText variant="secondary">Все значения назначены</AppText> : null}
          </ChipRow>
        </Section>
      ) : null}

      <View style={styles.table}>
        <View style={styles.row}>
          <AppText style={[styles.head, { flex: 1 }]}>Характеристика</AppText>
          <AppText style={[styles.head, styles.cell]}>База</AppText>
          <AppText style={[styles.head, styles.cell]}>Бонус</AppText>
          <AppText style={[styles.head, styles.cell]}>Итог</AppText>
          <AppText style={[styles.head, styles.cell]}>Мод.</AppText>
        </View>
        {ABILITY_IDS.map((id) => {
          const base = c.baseAbilities[id];
          const bonus = c.backgroundBonuses[id] ?? 0;
          return (
            <Pressable key={id} onPress={() => tapAbility(id)} style={({ pressed }) => [styles.row, styles.dataRow, pressed && { opacity: 0.8 }]}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.abbr}>{abilityAbbr(id)}</AppText>
                <AppText variant="secondary" style={{ fontSize: 12 }}>
                  {abilityName(id)}
                </AppText>
              </View>
              {c.abilityMethod === 'pointBuy' ? (
                <View style={styles.stepper}>
                  <StepButton label="−" disabled={base <= POINT_BUY_MIN} onPress={() => step(id, -1)} />
                  <AppText style={styles.value}>{base}</AppText>
                  <StepButton label="+" disabled={!canIncrease(id)} onPress={() => step(id, 1)} />
                </View>
              ) : (
                <View style={[styles.cell, styles.slot, !base && picked !== null && styles.slotTarget]}>
                  <AppText style={styles.value}>{base || '—'}</AppText>
                </View>
              )}
              <AppText style={[styles.cell, styles.value, { color: bonus ? colors.accent : colors.textSecondary }]}>
                {bonus ? `+${bonus}` : '—'}
              </AppText>
              <AppText style={[styles.cell, styles.value]}>{base ? totals[id] : '—'}</AppText>
              <AppText style={[styles.cell, styles.value, { color: colors.accent }]}>
                {base ? formatModifier(abilityModifier(totals[id])) : '—'}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {background ? <BackgroundBonuses c={c} allowed={background.abilities} /> : null}
    </WizardScreen>
  );
}

function BackgroundBonuses({ c, allowed }: { c: Character; allowed: AbilityId[] }) {
  const { update } = useDraft();
  const pattern = backgroundBonusPattern(c.backgroundBonuses);
  const plus2 = allowed.find((id) => c.backgroundBonuses[id] === 2);
  const plus1 = allowed.find((id) => c.backgroundBonuses[id] === 1);
  const set = (bonuses: Partial<AbilityScores>) => update((d) => ({ ...d, backgroundBonuses: bonuses }));

  const pick = (value: 2 | 1, id: AbilityId) => {
    const next: Partial<AbilityScores> = {};
    const two = value === 2 ? id : plus2 === id ? undefined : plus2;
    const one = value === 1 ? id : plus1 === id ? undefined : plus1;
    if (two) next[two] = 2;
    if (one && one !== two) next[one] = 1;
    set(next);
  };

  return (
    <Section title="Бонусы предыстории">
      <Hint>
        Предыстория «{nameOf('backgrounds', c.backgroundId)}» повышает {allowed.map(abilityAbbr).join(', ')}: +2 к одной и +1 к
        другой или +1 ко всем трём. Итог не выше 20.
      </Hint>
      <Segmented<'2-1' | '1-1-1'>
        value={pattern}
        onChange={(p) => set(p === '1-1-1' ? Object.fromEntries(allowed.map((id) => [id, 1])) : {})}
        options={[
          { value: '2-1', label: '+2 и +1' },
          { value: '1-1-1', label: '+1 к трём' },
        ]}
      />
      {pattern === '2-1' ? (
        <>
          <ChipRow>
            <AppText style={styles.bonusLabel}>+2</AppText>
            {allowed.map((id) => (
              <Chip key={id} label={abilityAbbr(id)} selected={plus2 === id} onPress={() => pick(2, id)} />
            ))}
          </ChipRow>
          <ChipRow>
            <AppText style={styles.bonusLabel}>+1</AppText>
            {allowed.map((id) => (
              <Chip key={id} label={abilityAbbr(id)} selected={plus1 === id} onPress={() => pick(1, id)} />
            ))}
          </ChipRow>
        </>
      ) : null}
    </Section>
  );
}

function StepButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.stepButton, (disabled || pressed) && { opacity: disabled ? 0.3 : 0.7 }]}
    >
      <AppText style={styles.value}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dataRow: { minHeight: 56, borderTopWidth: 1, borderTopColor: colors.border },
  head: { fontFamily: fonts.text, fontSize: 11, color: colors.textSecondary, paddingVertical: spacing.xs },
  cell: { width: 44, textAlign: 'center' },
  abbr: { fontFamily: fonts.display, fontSize: 15, color: colors.text },
  value: { fontFamily: fonts.display, fontSize: 16, color: colors.text, textAlign: 'center' },
  slot: { height: 40, borderRadius: 10, backgroundColor: colors.surface2, justifyContent: 'center' },
  slotTarget: { borderWidth: 1, borderColor: colors.accent },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  stepButton: {
    width: 32,
    height: sizes.touchMin,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusLabel: { fontFamily: fonts.display, fontSize: 16, color: colors.accent, alignSelf: 'center', width: 32 },
});
