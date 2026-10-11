import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { usePlay } from '@/components/play/CharacterContext';
import { D20Sheet, d20Parts, type D20Request } from '@/components/play/RollSheet';
import { Card, Dots, InfoSheet, plain, SmallButton, StatBox } from '@/components/play/ui';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';
import { abilityAbbr, nameOf } from '@/components/wizard/names';
import { byId, content, tr } from '@/content';
import type { AbilityId, Spell } from '@/content/types';
import { CHOICE_KEYS, choice1 } from '@/rules/choices';
import { magicInitiateSlots } from '@/rules/creation';
import { formatModifier } from '@/rules/dice';
import { adjustSlot, castSpell } from '@/rules/play';
import { spellAttackBonus, spellSaveDC } from '@/rules/spells';
import { colors, fonts, radius, sizes, spacing } from '@/theme';

type Info = { title: string; text: string; subtitle?: string };

function spellMeta(s: Spell): string {
  return [s.level === 0 ? 'Заговор' : `${s.level} круг`, tr(s.castingTime).text, tr(s.range).text, tr(s.duration).text]
    .filter(Boolean)
    .join(' · ');
}

export default function MagicTab() {
  const { character: c, sheet, updateState } = usePlay();
  const [info, setInfo] = useState<Info | null>(null);
  const [roll, setRoll] = useState<D20Request | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const sc = sheet.spellcasting;
  const ex = c.state.exhaustion;

  const initiates = magicInitiateSlots(c, content).map(({ slot, fixedList }) => {
    const ability = choice1(c, CHOICE_KEYS.featAbility(slot)) as AbilityId | undefined;
    const mod = ability ? sheet.abilities[ability].mod : 0;
    return {
      slot,
      list: fixedList ?? choice1(c, CHOICE_KEYS.featSpellList(slot)),
      ability,
      dc: spellSaveDC(mod, sheet.profBonus),
      attack: spellAttackBonus(mod, sheet.profBonus),
      spells: [...(c.choices[CHOICE_KEYS.featCantrips(slot)] ?? []), ...(c.choices[CHOICE_KEYS.featSpell(slot)] ?? [])],
    };
  });

  if (!sc && initiates.length === 0) {
    return (
      <Screen>
        <Placeholder title="Нет заклинаний" note="У этого персонажа пока нет умения творить заклинания." />
      </Screen>
    );
  }

  const cast = (spell: Spell) => {
    if (!sc) return;
    const result = castSpell(c.state, spell.level, sc.slots);
    if (!result) {
      Alert.alert('Нет ячеек', `Свободных ячеек ${spell.level} круга и выше не осталось.`);
      return;
    }
    updateState(() => result.state);
    setMessage(
      result.slotLevel === 0
        ? `${tr(spell.name).text}: заговор, ячейка не нужна`
        : `${tr(spell.name).text}: потрачена ячейка ${result.slotLevel} круга`,
    );
  };

  const spellRow = (id: string, canCast: boolean) => {
    const s = byId.spells.get(id);
    if (!s) return null;
    return (
      <Pressable
        key={id}
        accessibilityRole="button"
        onPress={() => setInfo({ title: tr(s.name).text, subtitle: spellMeta(s), text: [plain(s.description), plain(s.higherLevel)].filter(Boolean).join('\n\n') })}
        style={({ pressed }) => [styles.spell, pressed && { opacity: 0.85 }]}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.row}>
            <AppText style={{ fontFamily: fonts.textBold, flexShrink: 1 }}>{tr(s.name).text}</AppText>
            {s.concentration ? <Badge label="К" /> : null}
            {s.ritual ? <Badge label="Р" /> : null}
          </View>
          <AppText variant="secondary" style={{ fontSize: 13 }} numberOfLines={2}>
            {spellMeta(s)}
          </AppText>
        </View>
        {canCast && s.level > 0 ? <SmallButton title="Сотворить" tone="accent" onPress={() => cast(s)} /> : null}
      </Pressable>
    );
  };

  return (
    <Screen>
      {sc ? (
        <>
          <View style={styles.row}>
            <StatBox label={`СЛ спасброска (${abilityAbbr(sc.ability)})`} value={String(sc.saveDC)} />
            <StatBox
              label="Атака заклинанием"
              value={formatModifier(sc.attackBonus)}
              accent
              onPress={() => setRoll({ title: 'Атака заклинанием', parts: d20Parts([{ label: 'Атака', value: sc.attackBonus }], ex) })}
            />
          </View>

          <Card>
            <AppText variant="heading">Ячейки</AppText>
            <AppText variant="secondary">Закрашенный кружок — потраченная ячейка. Нажмите, чтобы потратить или вернуть.</AppText>
            {sc.slots.map((max, i) =>
              max > 0 ? (
                <View key={i} style={styles.row}>
                  <AppText style={{ width: 70 }}>{i + 1} круг</AppText>
                  <Dots
                    total={max}
                    filled={c.state.slotsSpent[i] ?? 0}
                    onPress={(dot) => updateState((s) => adjustSlot(s, i + 1, dot < (s.slotsSpent[i] ?? 0) ? -1 : 1, sc.slots))}
                  />
                </View>
              ) : null,
            )}
          </Card>

          {message ? <AppText style={{ color: colors.accent }}>{message}</AppText> : null}

          {c.cantrips.length ? (
            <View style={styles.section}>
              <AppText variant="heading">Заговоры</AppText>
              {c.cantrips.map((id) => spellRow(id, true))}
            </View>
          ) : null}
          {c.preparedSpells.length ? (
            <View style={styles.section}>
              <AppText variant="heading">Подготовленные</AppText>
              {c.preparedSpells.map((id) => spellRow(id, true))}
            </View>
          ) : null}
        </>
      ) : null}

      {initiates.map((mi) => (
        <View key={mi.slot} style={styles.section}>
          <AppText variant="heading">{nameOf('feats', 'magic-initiate')}</AppText>
          <AppText variant="secondary">
            Список: {nameOf('classes', mi.list)} · {mi.ability ? abilityAbbr(mi.ability) : '—'} · СЛ {mi.dc} · атака {formatModifier(mi.attack)}
            {'\n'}Заклинание 1-го круга можно сотворить раз в день без ячейки (отметку пока ведите сами).
          </AppText>
          {mi.spells.map((id) => spellRow(id, !!sc))}
        </View>
      ))}

      <AppText variant="secondary">К — концентрация, Р — ритуал.</AppText>

      <InfoSheet info={info} onClose={() => setInfo(null)} />
      <D20Sheet request={roll} onClose={() => setRoll(null)} />
    </Screen>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <AppText style={{ fontFamily: fonts.textBold, fontSize: 11, color: colors.info }}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.sm },
  spell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.touchMin + 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.button,
    padding: spacing.md,
  },
  badge: { backgroundColor: colors.infoBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
});
