import { ABILITY_IDS, characterResources, deathSave, EXHAUSTION_MAX, featureInfo, longRest, setExhaustion, speedWithExhaustion, toggleCondition } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { MAX_LEVEL } from '@/features/level-up';
import { ShortRestSheet } from '@/features/rest';
import type { D20Request } from '@/features/roll-dice';
import { d20Parts, D20Sheet } from '@/features/roll-dice';
import { HpBlock } from '@/features/track-hp';
import { ResourcesCard } from '@/features/track-resources';
import { colors } from '@/shared/config';
import { abilityAbbr, byId, content, nameOf, plain, tr } from '@/shared/content';
import { formatModifier, rollD20 } from '@/shared/lib/dice';
import type { InfoContent } from '@/shared/ui';
import { AppText, BottomSheet, Card, Chip, ChipRow, InfoSheet, Screen, SmallButton, StatBox } from '@/shared/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { styles } from './PlaySheetPage.styles';

export function PlaySheetPage() {
  const { character: c, sheet, update, updateState } = usePlay();
  const [roll, setRoll] = useState<D20Request | null>(null);
  const [info, setInfo] = useState<(InfoContent & { conditionId?: string }) | null>(null);
  const [pickCondition, setPickCondition] = useState(false);
  const [shortRest, setShortRest] = useState(false);
  const resources = characterResources(c, content, sheet);

  const ex = c.state.exhaustion;
  const subtitle = [
    c.classes.map((e) => `${nameOf('classes', e.classId)} ${e.level}`).join(' / '),
    nameOf('species', c.speciesId),
    nameOf('backgrounds', c.backgroundId),
  ].join(' · ');

  const rollAbility = (id: (typeof ABILITY_IDS)[number], save: boolean) => {
    const a = sheet.abilities[id];
    const parts = [{ label: abilityAbbr(id), value: a.mod }];
    if (save && a.saveProficient) parts.push({ label: 'БМ', value: sheet.profBonus });
    setRoll({ title: `${save ? 'Спасбросок' : 'Проверка'}: ${abilityAbbr(id)}`, parts: d20Parts(parts, ex) });
  };

  const rollInitiative = () => {
    const parts = [{ label: 'ЛОВ', value: sheet.abilities.dex.mod }];
    if (sheet.initiative !== sheet.abilities.dex.mod) parts.push({ label: 'Бдительность', value: sheet.initiative - sheet.abilities.dex.mod });
    setRoll({ title: 'Инициатива', parts: d20Parts(parts, ex) });
  };

  const rollDeathSave = () => {
    const parts = d20Parts([], ex);
    const modifier = parts.reduce((s, p) => s + p.value, 0);
    const r = rollD20(modifier);
    updateState((s) => deathSave(s, r.natural, r.total));
    setRoll({ title: 'Спасбросок от смерти', parts, roll: r });
  };

  const confirmLongRest = () =>
    Alert.alert('Долгий отдых', 'Восстановить все хиты, кости хитов, ячейки и ресурсы умений; снять 1 уровень истощения?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Отдохнуть', onPress: () => updateState((s) => longRest(s, sheet.maxHp)) },
    ]);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <AppText variant="secondary" style={{ flex: 1 }}>
          {subtitle}
        </AppText>
        <Chip
          label={c.state.heroicInspiration ? '★ Вдохновение' : '☆ Вдохновение'}
          selected={c.state.heroicInspiration}
          onPress={() => updateState((s) => ({ ...s, heroicInspiration: !s.heroicInspiration }))}
        />
      </View>

      <HpBlock c={c} sheet={sheet} onDeathSave={rollDeathSave} />

      <View style={styles.row}>
        <StatBox label="КЗ" value={String(sheet.armorClass)} />
        <StatBox label="Инициатива" value={formatModifier(sheet.initiative)} onPress={rollInitiative} accent />
        <StatBox label="Скорость" value={`${speedWithExhaustion(sheet.speed, ex)}`} />
        <StatBox label="БМ" value={formatModifier(sheet.profBonus)} />
      </View>

      <View style={styles.grid}>
        {ABILITY_IDS.map((id) => {
          const a = sheet.abilities[id];
          return (
            <View key={id} style={styles.ability}>
              <Pressable accessibilityRole="button" onPress={() => rollAbility(id, false)} style={styles.abilityTop}>
                <AppText style={styles.abilityAbbr}>{abilityAbbr(id)}</AppText>
                <AppText style={styles.abilityMod}>{formatModifier(a.mod)}</AppText>
                <AppText style={styles.abilityScore}>{a.score}</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => rollAbility(id, true)}
                style={[styles.save, a.saveProficient && { backgroundColor: colors.accentBg }]}
              >
                <AppText style={[styles.saveText, a.saveProficient && { color: colors.accent }]}>
                  Спас {formatModifier(a.save)}
                  {a.saveProficient ? ' ●' : ''}
                </AppText>
              </Pressable>
            </View>
          );
        })}
      </View>

      <ResourcesCard resources={resources} />

      <Card>
        <AppText variant="heading">Состояния</AppText>
        <ChipRow>
          {c.state.conditions.map((id) => {
            const cond = byId.conditions.get(id);
            return (
              <Chip
                key={id}
                label={tr(cond?.name).text || id}
                selected
                onPress={() => setInfo({ title: tr(cond?.name).text, text: plain(cond?.description), conditionId: id })}
              />
            );
          })}
          <Chip label="+ Состояние" onPress={() => setPickCondition(true)} />
        </ChipRow>
        <View style={styles.exhaustion}>
          <AppText style={{ flex: 1 }}>
            Истощение: {ex} / {EXHAUSTION_MAX}
            {ex ? <AppText variant="secondary">{`  (к20 ${formatModifier(-2 * ex)}, скорость −${5 * ex} фт)`}</AppText> : null}
          </AppText>
          <SmallButton title="−" disabled={ex === 0} onPress={() => updateState((s) => setExhaustion(s, s.exhaustion - 1))} />
          <SmallButton title="+" disabled={ex === EXHAUSTION_MAX} onPress={() => updateState((s) => setExhaustion(s, s.exhaustion + 1))} />
        </View>
      </Card>

      <Card>
        <AppText variant="heading">Умения</AppText>
        <ChipRow>
          {sheet.features.map((f) => (
            <Chip key={`${f.source}-${f.id}`} label={featureInfo(f).title} onPress={() => setInfo(featureInfo(f))} />
          ))}
        </ChipRow>
      </Card>

      {c.classes[0].level < MAX_LEVEL ? (
        <SmallButton
          title={`Повысить уровень (${c.classes[0].level} → ${c.classes[0].level + 1})`}
          tone="accent"
          onPress={() => router.navigate({ pathname: '/character/[id]/level-up', params: { id: c.id } })}
        />
      ) : null}

      <View style={styles.row}>
        <SmallButton title="Короткий отдых" flex={1} onPress={() => setShortRest(true)} />
        <SmallButton title="Долгий отдых" flex={1} onPress={confirmLongRest} />
      </View>

      <D20Sheet request={roll} onClose={() => setRoll(null)} />

      <InfoSheet info={info} onClose={() => setInfo(null)}>
        {info?.conditionId ? (
          <SmallButton
            title="Снять состояние"
            tone="accent"
            onPress={() => {
              updateState((s) => toggleCondition(s, info.conditionId!));
              setInfo(null);
            }}
          />
        ) : null}
      </InfoSheet>

      <BottomSheet visible={pickCondition} title="Добавить состояние" onClose={() => setPickCondition(false)}>
        <ChipRow>
          {content.conditions
            .filter((x) => x.id !== 'exhaustion' && !c.state.conditions.includes(x.id))
            .map((x) => (
              <Chip
                key={x.id}
                label={tr(x.name).text}
                onPress={() => {
                  updateState((s) => toggleCondition(s, x.id));
                  setPickCondition(false);
                }}
              />
            ))}
        </ChipRow>
      </BottomSheet>

      <ShortRestSheet visible={shortRest} onClose={() => setShortRest(false)} />
    </Screen>
  );
}
