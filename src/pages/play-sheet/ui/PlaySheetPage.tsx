import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ABILITY_IDS, EXHAUSTION_MAX } from '@/entities/character/config/constants';
import { usePlay } from '@/entities/character/model/CharacterContext';
import {
    deathSave,
    deathStatus,
    finishShortRest,
    setExhaustion,
    speedWithExhaustion,
    toggleCondition,
} from '@/entities/character/model/play';
import { characterResources, shortRestResources } from '@/entities/character/model/resources';
import { applyDamage, applyHealing, longRest, setTempHp, spendHitDie } from '@/entities/character/model/rest';
import { hpLevel } from '@/entities/character/model/summary';
import type { Character, CharacterSheet, SourcedId } from '@/entities/character/model/types';
import { MAX_LEVEL } from '@/features/level-up/config/constants';
import { d20Parts, D20Sheet, type D20Request } from '@/features/roll-dice/ui/RollSheet';
import { ResourcesCard } from '@/features/track-resources/ui/ResourcesCard';
import { colors, fonts, radius, spacing } from '@/shared/config/theme';
import { byId, content, tr } from '@/shared/content/content';
import { abilityAbbr, nameOf } from '@/shared/content/names';
import { formatModifier, rollD20, rollDie } from '@/shared/lib/dice/dice';
import { Card, Dots, InfoSheet, plain, SmallButton, StatBox } from '@/shared/ui/_split/play-ui';
import { Chip, ChipRow } from '@/shared/ui/_split/wizard-ui';
import { AppText } from '@/shared/ui/AppText/AppText';
import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';
import { Screen } from '@/shared/ui/Screen/Screen';

const HP_COLORS = { good: colors.heal, warn: colors.accent, danger: colors.damage } as const;

type Info = { title: string; text: string; subtitle?: string };

function featureInfo(f: SourcedId): Info {
  if (f.source === 'species') {
    const t = byId.traits.get(f.id);
    return { title: nameOf('traits', f.id), text: plain(t?.description), subtitle: 'Вид' };
  }
  if (f.source === 'feat') {
    const t = byId.feats.get(f.id);
    return { title: nameOf('feats', f.id), text: plain(t?.description), subtitle: 'Черта' };
  }
  const t = byId.features.get(f.id);
  return { title: nameOf('features', f.id), text: plain(t?.description), subtitle: f.source === 'class' ? 'Класс' : 'Подкласс' };
}

export function PlaySheetPage() {
  const { character: c, sheet, update, updateState } = usePlay();
  const [roll, setRoll] = useState<D20Request | null>(null);
  const [info, setInfo] = useState<(Info & { conditionId?: string }) | null>(null);
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

function HpBlock({ c, sheet, onDeathSave }: { c: Character; sheet: CharacterSheet; onDeathSave: () => void }) {
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

function ShortRestSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { character: c, sheet, updateState } = usePlay();
  const [last, setLast] = useState<string | null>(null);
  const conMod = sheet.abilities.con.mod;
  const resources = characterResources(c, content, sheet);
  const restored = [
    ...(sheet.spellcasting?.classId === 'warlock' && c.state.slotsSpent.some(Boolean) ? ['ячейки Магии договора'] : []),
    ...resources
      .filter((r) => r.spent > 0 && r.recovery !== 'long')
      .map((r) => `${tr(r.name).text}${r.recovery === 'short-one' && r.spent > 1 ? ' (1)' : ''}`),
  ];

  return (
    <BottomSheet
      visible={visible}
      title="Короткий отдых"
      onClose={() => {
        setLast(null);
        onClose();
      }}
    >
      <AppText variant="secondary">Можно потратить кости хитов: каждая восстанавливает бросок кости + мод. ТЕЛ (минимум 1).</AppText>
      {sheet.hitDice.map((h) => {
        const left = h.total - (c.state.hitDiceSpent[h.classId] ?? 0);
        return (
          <View key={h.classId} style={styles.row}>
            <AppText style={{ flex: 1 }}>
              {nameOf('classes', h.classId)}: {left} из {h.total} к{h.die}
            </AppText>
            <SmallButton
              title={`Потратить к${h.die}${conMod ? formatModifier(conMod) : ''}`}
              tone="heal"
              disabled={left === 0 || c.state.currentHp >= sheet.maxHp}
              onPress={() => {
                const r = rollDie(h.die);
                setLast(`Выпало ${r}${conMod ? ` ${formatModifier(conMod)}` : ''} → +${Math.max(1, r + conMod)} хитов`);
                updateState((s) => spendHitDie(s, h.classId, h.total, r, conMod, sheet.maxHp));
              }}
            />
          </View>
        );
      })}
      {last ? <AppText style={{ color: colors.heal }}>{last}</AppText> : null}
      <AppText variant="secondary">
        Хиты: {c.state.currentHp} / {sheet.maxHp}
      </AppText>
      {restored.length ? <AppText variant="secondary">После отдыха восстановится: {restored.join(', ')}.</AppText> : null}
      <SmallButton
        title="Завершить отдых"
        tone="accent"
        onPress={() => {
          updateState((s) => shortRestResources(finishShortRest(s, sheet.spellcasting?.classId === 'warlock'), resources));
          setLast(null);
          onClose();
        }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hpTop: { flexDirection: 'row', alignItems: 'flex-end' },
  hpValue: { fontFamily: fonts.displayBold, fontSize: 48, lineHeight: 56 },
  hpMax: { fontFamily: fonts.display, fontSize: 22, color: colors.textSecondary },
  temp: { alignItems: 'center', backgroundColor: colors.infoBg, borderRadius: 14, padding: spacing.sm },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.surface2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  amount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: 14,
    minHeight: 44,
  },
  amountBtn: { width: 32, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  amountSign: { fontFamily: fonts.display, fontSize: 18, color: colors.textSecondary },
  amountInput: {
    width: 44,
    textAlign: 'center',
    color: colors.text,
    fontFamily: fonts.displayBold,
    fontSize: 18,
    padding: 0,
  },
  death: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ability: {
    width: '31.5%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card - 4,
    overflow: 'hidden',
  },
  abilityTop: { alignItems: 'center', paddingVertical: spacing.sm },
  abilityAbbr: { fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary },
  abilityMod: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.text },
  abilityScore: { fontFamily: fonts.text, fontSize: 13, color: colors.textSecondary },
  save: { minHeight: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  saveText: { fontFamily: fonts.textMedium, fontSize: 13, color: colors.text },
  exhaustion: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
