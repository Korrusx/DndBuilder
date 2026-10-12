import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import {
  adjustSlot,
  castSpell,
  choice1,
  CHOICE_KEYS,
  magicInitiateSlots,
  spellAttackBonus,
  spellSaveDC,
} from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { SpellsEditSheet } from '@/features/edit-spells';
import type { D20Request } from '@/features/roll-dice';
import { d20Parts, D20Sheet } from '@/features/roll-dice';
import type { AbilityId, Spell } from '@/shared/content';
import { abilityAbbr, byId, content, nameOf, plain, spellMeta, tr } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatModifier } from '@/shared/lib/dice';
import type { InfoContent } from '@/shared/ui';
import { AppText, Badge, Card, Dots, InfoSheet, Placeholder, Screen, SmallButton, StatBox } from '@/shared/ui';

import { styles } from './PlayMagicPage.styles';

export function PlayMagicPage() {
  const { character: c, sheet, update, updateState } = usePlay();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [info, setInfo] = useState<InfoContent | null>(null);
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
        <Placeholder title={t('magic.none')} note={t('magic.noneHint')} />
      </Screen>
    );
  }

  const cast = (spell: Spell) => {
    if (!sc) return;
    const result = castSpell(c.state, spell.level, sc.slots);
    if (!result) {
      Alert.alert(t('magic.noSlots'), t('magic.noSlotsHint', { level: spell.level }));
      return;
    }
    updateState(() => result.state);
    setMessage(
      result.slotLevel === 0
        ? t('magic.castCantrip', { name: tr(spell.name).text })
        : t('magic.castSlot', { name: tr(spell.name).text, level: result.slotLevel }),
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
        <View style={styles.fillGap2}>
          <View style={styles.row}>
            <AppText style={styles.spellName}>{tr(s.name).text}</AppText>
            {s.concentration ? <Badge label={t('magic.concentrationBadge')} /> : null}
            {s.ritual ? <Badge label={t('magic.ritualBadge')} /> : null}
          </View>
          <AppText variant="secondary" style={styles.size13} numberOfLines={2}>
            {spellMeta(s)}
          </AppText>
        </View>
        {canCast && s.level > 0 ? <SmallButton title={t('magic.cast')} tone="accent" onPress={() => cast(s)} /> : null}
      </Pressable>
    );
  };

  return (
    <Screen>
      {sc ? (
        <>
          <View style={styles.row}>
            <StatBox label={t('magic.saveDC', { ability: abilityAbbr(sc.ability) })} value={String(sc.saveDC)} />
            <StatBox
              label={t('magic.spellAttack')}
              value={formatModifier(sc.attackBonus)}
              accent
              onPress={() => setRoll({ title: t('magic.spellAttack'), parts: d20Parts([{ label: t('magic.attack'), value: sc.attackBonus }], ex) })}
            />
          </View>

          <Card>
            <AppText variant="heading">{t('magic.slots')}</AppText>
            <AppText variant="secondary">{t('magic.slotsHint')}</AppText>
            {sc.slots.map((max, i) =>
              max > 0 ? (
                <View key={i} style={styles.row}>
                  <AppText style={styles.width70}>{t('spell.circle', { level: i + 1 })}</AppText>
                  <Dots
                    total={max}
                    filled={c.state.slotsSpent[i] ?? 0}
                    onPress={(dot) => updateState((s) => adjustSlot(s, i + 1, dot < (s.slotsSpent[i] ?? 0) ? -1 : 1, sc.slots))}
                  />
                </View>
              ) : null,
            )}
          </Card>

          <SmallButton title={t('magic.editSpells')} onPress={() => setEditing(true)} />
          {message ? <AppText style={styles.textAccent}>{message}</AppText> : null}

          {c.cantrips.length ? (
            <View style={styles.section}>
              <AppText variant="heading">{t('magic.cantrips')}</AppText>
              {c.cantrips.map((id) => spellRow(id, true))}
            </View>
          ) : null}
          {c.preparedSpells.length ? (
            <View style={styles.section}>
              <AppText variant="heading">{t('magic.prepared')}</AppText>
              {c.preparedSpells.map((id) => spellRow(id, true))}
            </View>
          ) : null}
        </>
      ) : null}

      {initiates.map((mi) => (
        <View key={mi.slot} style={styles.section}>
          <AppText variant="heading">{nameOf('feats', 'magic-initiate')}</AppText>
          <AppText variant="secondary">
            {t('magic.initiateStats', { list: nameOf('classes', mi.list), ability: mi.ability ? abilityAbbr(mi.ability) : '—', dc: mi.dc, attack: formatModifier(mi.attack) })}
            {'\n'}
            {t('magic.initiateHint')}
          </AppText>
          {mi.spells.map((id) => spellRow(id, !!sc))}
        </View>
      ))}

      <AppText variant="secondary">{t('magic.legend')}</AppText>

      <InfoSheet info={info} onClose={() => setInfo(null)} />
      <SpellsEditSheet
        visible={editing}
        character={c}
        onChange={(patch) => update((d) => ({ ...d, ...patch }))}
        onClose={() => setEditing(false)}
      />
      <D20Sheet request={roll} onClose={() => setRoll(null)} />
    </Screen>
  );
}
