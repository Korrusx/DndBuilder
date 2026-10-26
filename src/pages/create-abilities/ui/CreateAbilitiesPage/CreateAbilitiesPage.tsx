import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { AbilityMethod, AbilityRoll, AbilityScores } from '@/entities/character';
import {
  ABILITY_IDS,
  abilityModifier,
  finalAbilityScores,
  POINT_BUY_BUDGET,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  pointBuyCost,
  pointBuySpent,
  roll4d6DropLowest,
  STANDARD_ARRAY,
} from '@/entities/character';
import { StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import type { AbilityId } from '@/shared/content';
import { abilityAbbr, abilityName, byId, content } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatModifier } from '@/shared/lib/dice';
import { AppText, Button, Chip, ChipRow, Hint, Section, Segmented } from '@/shared/ui';

import { ALL_EIGHT, EMPTY } from '../../config/constants';
import { freeValues } from '../../lib/freeValues';
import { BackgroundBonuses } from '../BackgroundBonuses/BackgroundBonuses';
import { StepButton } from '../StepButton/StepButton';
import { styles } from './CreateAbilitiesPage.styles';

export function CreateAbilitiesPage() {
  const { character, update, issues: allIssues } = useDraft();
  const { t } = useTranslation();
  const [picked, setPicked] = useState<number | null>(null);
  const [lastRolls, setLastRolls] = useState<AbilityRoll[] | null>(null);
  const background = byId.backgrounds.get(character.backgroundId);
  const issues = allIssues.filter((i) => i.step === 3);

  const pool: number[] =
    character.abilityMethod === 'standard'
      ? [...STANDARD_ARRAY]
      : character.abilityMethod === 'roll'
        ? (character.abilityRolls ?? [])
        : [];
  const free = freeValues(pool, character.baseAbilities);
  const totals = finalAbilityScores({ ...character, feats: [] }, content);
  // Прибавки происхождения: 2024 — бонусы предыстории, 2014 — прибавки расы (итог при нулевой базе).
  const bonuses = finalAbilityScores({ ...character, feats: [], baseAbilities: EMPTY }, content);
  const raceBonusList = ABILITY_IDS.filter((id) => bonuses[id] !== 0).map(
    (id) => `${abilityAbbr(id)} ${formatModifier(bonuses[id])}`,
  );
  const spent = character.abilityMethod === 'pointBuy' ? pointBuySpent(character.baseAbilities) : undefined;

  const setBase = (fn: (b: AbilityScores) => AbilityScores) =>
    update((d) => ({ ...d, baseAbilities: fn(d.baseAbilities) }));

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
    if (character.abilityMethod === 'pointBuy') {
      return;
    }
    if (picked !== null) {
      setBase((b) => ({ ...b, [id]: free[picked] }));
      setPicked(null);
    } else if (character.baseAbilities[id]) {
      setBase((b) => ({ ...b, [id]: 0 }));
    }
  };

  const step = (id: AbilityId, delta: number) =>
    setBase((b) => ({ ...b, [id]: Math.min(POINT_BUY_MAX, Math.max(POINT_BUY_MIN, b[id] + delta)) }));

  const canIncrease = (id: AbilityId) => {
    const v = character.baseAbilities[id];
    if (v >= POINT_BUY_MAX) {
      return false;
    }
    const extra = (pointBuyCost(v + 1) ?? 99) - (pointBuyCost(v) ?? 0);
    return (spent ?? 0) + extra <= POINT_BUY_BUDGET;
  };

  const abilityMethodOptions = [
    { value: 'standard' as AbilityMethod, label: t('abilities.standard') },
    { value: 'pointBuy' as AbilityMethod, label: t('abilities.pointBuy') },
    { value: 'roll' as AbilityMethod, label: t('abilities.roll') },
  ];

  return (
    <WizardScreen step={3} canContinue={issues.length === 0} summary={<StepStatus issues={issues} />}>
      <Segmented<AbilityMethod>
        value={character.abilityMethod}
        onChange={changeMethod}
        options={abilityMethodOptions}
      />

      {character.abilityMethod === 'roll' ? (
        <View style={styles.gapSm}>
          <Button
            title={character.abilityRolls?.length ? t('abilities.reroll') : t('abilities.rollSix')}
            variant="secondary"
            onPress={roll}
          />
          {lastRolls ? (
            <AppText variant="secondary">
              {lastRolls
                .map(
                  (r) =>
                    r.dice.map((d, i) => (i === r.droppedIndex ? `(${d})` : String(d))).join(' ') + ` = ${r.total}`,
                )
                .join('\n')}
            </AppText>
          ) : null}
        </View>
      ) : null}

      {character.abilityMethod === 'pointBuy' ? (
        <AppText variant="heading" style={(spent ?? 0) <= POINT_BUY_BUDGET ? styles.pointsOk : styles.pointsOver}>
          {t('abilities.pointsLeft', { left: POINT_BUY_BUDGET - (spent ?? 0), total: POINT_BUY_BUDGET })}
        </AppText>
      ) : pool.length ? (
        <Section title={t('abilities.values')} hint={free.length ? t('abilities.valuesHint') : undefined}>
          <ChipRow>
            {free.map((v, i) => (
              <Chip
                key={`${v}-${i}`}
                label={String(v)}
                selected={picked === i}
                onPress={() => setPicked(picked === i ? null : i)}
              />
            ))}
            {free.length === 0 ? <AppText variant="secondary">{t('abilities.allAssigned')}</AppText> : null}
          </ChipRow>
        </Section>
      ) : null}

      <View style={styles.table}>
        <View style={styles.row}>
          <AppText style={[styles.head, styles.fill]}>{t('abilities.ability')}</AppText>
          <AppText style={[styles.head, styles.cell]}>{t('abilities.base')}</AppText>
          <AppText style={[styles.head, styles.cell]}>{t('abilities.bonus')}</AppText>
          <AppText style={[styles.head, styles.cell]}>{t('abilities.total')}</AppText>
          <AppText style={[styles.head, styles.cell]}>{t('abilities.mod')}</AppText>
        </View>
        {ABILITY_IDS.map((id) => {
          const base = character.baseAbilities[id];
          const bonus = bonuses[id];
          return (
            <Pressable
              key={id}
              onPress={() => tapAbility(id)}
              style={({ pressed }) => [styles.row, styles.dataRow, pressed && { opacity: 0.8 }]}
            >
              <View style={styles.fill}>
                <AppText style={styles.abbr}>{abilityAbbr(id)}</AppText>
                <AppText variant="secondary" style={styles.size12}>
                  {abilityName(id)}
                </AppText>
              </View>
              {character.abilityMethod === 'pointBuy' ? (
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
              <AppText style={[styles.cell, styles.value, bonus ? styles.valueAccent : styles.valueDim]}>
                {bonus ? formatModifier(bonus) : '—'}
              </AppText>
              <AppText style={[styles.cell, styles.value]}>{base ? totals[id] : '—'}</AppText>
              <AppText style={[styles.cell, styles.value, styles.valueAccent]}>
                {base ? formatModifier(abilityModifier(totals[id])) : '—'}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {background?.abilities.length ? <BackgroundBonuses character={character} allowed={background.abilities} /> : null}
      {character.edition === '2014' ? (
        <Hint>
          {raceBonusList.length
            ? t('abilities.raceHint', { list: raceBonusList.join(', ') })
            : t('abilities.raceHintNone')}
        </Hint>
      ) : null}
    </WizardScreen>
  );
}
