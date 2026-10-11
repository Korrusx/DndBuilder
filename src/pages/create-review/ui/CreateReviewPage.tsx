import { FEATURE_SOURCE_LABEL } from '@/entities/character/config/featureSource';
import { featureName } from '@/entities/character/lib/features';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ABILITY_IDS } from '@/entities/character/config/constants';
import { computeSheet } from '@/entities/character/model/sheet';
import type { Character, CharacterSheet } from '@/entities/character/model/types';
import { useDraft } from '@/features/create-character/model/DraftContext';
import { draftIssues } from '@/features/create-character/model/validation';
import { WizardScreen } from '@/features/create-character/ui/WizardScreen/WizardScreen';
import { usePdfExport } from '@/features/export-pdf/model/usePdfExport';
import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { content, tr } from '@/shared/content/content';
import { abilityAbbr, abilityName, coinsText, groupSkillsByAbility, nameOf, proficiencyName, spellName } from '@/shared/content/names';
import { formatDamage, formatModifier } from '@/shared/lib/dice/dice';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Button } from '@/shared/ui/Button/Button';
import { Chip } from '@/shared/ui/Chip/Chip';
import { ChipRow } from '@/shared/ui/ChipRow/ChipRow';
import { Section } from '@/shared/ui/Section/Section';

function safeSheet(c: Character): CharacterSheet | null {
  try {
    return computeSheet(c, content);
  } catch {
    return null;
  }
}

export function CreateReviewPage() {
  const { character: c, update, goTo, finish } = useDraft();
  const pdf = usePdfExport();
  const issues = draftIssues(c, content);
  const blocking = issues.filter((i) => i.blocking);
  const sheet = issues.some((i) => i.blocking && i.step <= 2) ? null : safeSheet(c);
  const subtitle = [
    `${nameOf('classes', c.classes[0]?.classId)} 1`,
    nameOf('species', c.speciesId),
    nameOf('backgrounds', c.backgroundId),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <WizardScreen
      step={6}
      canContinue={blocking.length === 0}
      footer={
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Button
              title={pdf.busy ? 'PDF…' : 'PDF'}
              variant="secondary"
              disabled={pdf.busy || blocking.length > 0}
              onPress={() => pdf.run(c)}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button title="Начать игру" disabled={blocking.length > 0} onPress={finish} />
          </View>
        </View>
      }
    >
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarLetter}>{(c.name.trim()[0] ?? '?').toUpperCase()}</AppText>
        </View>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <TextInput
            value={c.name}
            onChangeText={(name) => update((d) => ({ ...d, name }))}
            placeholder="Имя персонажа"
            placeholderTextColor={colors.textSecondary}
            style={styles.nameInput}
          />
          <AppText variant="secondary">{subtitle}</AppText>
        </View>
      </View>

      {issues.length ? (
        <View style={{ gap: spacing.sm }}>
          {issues.map((i) => (
            <View key={i.message} style={[styles.issue, !i.blocking && { backgroundColor: colors.infoBg }]}>
              <AppText style={{ flex: 1, color: i.blocking ? colors.damage : colors.info, fontSize: 14 }}>{i.message}</AppText>
              {i.step < 6 ? (
                <Pressable accessibilityRole="button" onPress={() => goTo(i.step)} style={styles.fix}>
                  <AppText style={{ color: colors.accent, fontFamily: fonts.textBold }}>Исправить</AppText>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <Section title="Мировоззрение">
        <ChipRow>
          {content.alignments.map((a) => (
            <Chip
              key={a.id}
              label={tr(a.name).text}
              selected={c.alignment === a.id}
              onPress={() => update((d) => ({ ...d, alignment: d.alignment === a.id ? undefined : a.id }))}
            />
          ))}
        </ChipRow>
      </Section>

      {sheet ? <SheetPreview c={c} sheet={sheet} /> : null}
    </WizardScreen>
  );
}

function SheetPreview({ c, sheet }: { c: Character; sheet: CharacterSheet }) {
  const main = [
    { label: 'Хиты', value: String(sheet.maxHp) },
    { label: 'КЗ', value: String(sheet.armorClass) },
    { label: 'Инициатива', value: formatModifier(sheet.initiative) },
    { label: 'Скорость', value: `${sheet.speed} фт` },
    { label: 'Бонус мастерства', value: formatModifier(sheet.profBonus) },
    { label: 'Пасс. восприятие', value: String(sheet.passivePerception) },
  ];
  return (
    <>
      <Grid>
        {main.map((m) => (
          <Stat key={m.label} label={m.label} value={m.value} />
        ))}
      </Grid>

      <Section title="Характеристики">
        <Grid>
          {ABILITY_IDS.map((id) => {
            const a = sheet.abilities[id];
            return (
              <Stat
                key={id}
                label={abilityAbbr(id)}
                value={formatModifier(a.mod)}
                note={`${a.score} · спас ${formatModifier(a.save)}${a.saveProficient ? ' ●' : ''}`}
              />
            );
          })}
        </Grid>
      </Section>

      <Section title="Навыки" hint="● владение, ◆ компетентность">
        <View style={styles.card}>
          {groupSkillsByAbility(sheet.skills).map(({ ability, skills }) => (
            <View key={ability} style={{ paddingVertical: spacing.xs }}>
              <AppText style={{ fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary }}>{abilityName(ability)}</AppText>
              {skills.map((s) => (
                <View key={s.id} style={styles.line}>
                  <AppText style={{ width: 18, color: colors.accent }}>{s.expertise ? '◆' : s.proficient ? '●' : ''}</AppText>
                  <AppText style={{ flex: 1, color: s.proficient ? colors.text : colors.textSecondary }}>{nameOf('skills', s.id)}</AppText>
                  <AppText style={styles.num}>{formatModifier(s.bonus)}</AppText>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Section>

      {sheet.attacks.length ? (
        <Section title="Атаки">
          <View style={styles.card}>
            {sheet.attacks.map((a) => (
              <View key={a.itemId} style={styles.line}>
                <AppText style={{ flex: 1 }}>{nameOf('equipment', a.itemId)}</AppText>
                <AppText style={[styles.num, { width: 48 }]}>{formatModifier(a.toHit)}</AppText>
                <AppText style={[styles.num, { width: 80 }]}>{formatDamage(a.damageDice, a.damageBonus)}</AppText>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {c.cantrips.length || c.preparedSpells.length ? (
        <Section title="Заклинания">
          {sheet.spellcasting ? (
            <AppText variant="secondary">
              СЛ {sheet.spellcasting.saveDC} · бонус атаки {formatModifier(sheet.spellcasting.attackBonus)}
            </AppText>
          ) : null}
          <AppText>{[...c.cantrips, ...c.preparedSpells].map(spellName).join(', ')}</AppText>
        </Section>
      ) : null}

      <Section title="Что умеет">
        <View style={styles.card}>
          {sheet.features.map((f) => (
            <View key={`${f.source}-${f.id}`} style={styles.line}>
              <AppText style={{ flex: 1 }}>{featureName(f)}</AppText>
              <AppText variant="secondary">{FEATURE_SOURCE_LABEL[f.source]}</AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Владения">
        <AppText variant="secondary">
          {sheet.proficiencies
            .filter((id) => !id.startsWith('skill-'))
            .map(proficiencyName)
            .join(', ') || '—'}
        </AppText>
        <AppText variant="secondary">Языки: {c.languages.map((l) => nameOf('languages', l)).join(', ')}</AppText>
        <AppText variant="secondary">Монеты: {coinsText(c.coins) || '—'}</AppText>
      </Section>
    </>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.stat}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText variant="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
        {label}
      </AppText>
      {note ? (
        <AppText variant="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: spacing.sm },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.accent },
  nameInput: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 18,
  },
  issue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.damageBg,
    borderRadius: 14,
    paddingLeft: spacing.md,
    minHeight: sizes.touchMin,
  },
  fix: { minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    width: '31.5%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  line: { flexDirection: 'row', alignItems: 'center', minHeight: 36, gap: spacing.sm },
  num: { fontFamily: fonts.display, fontSize: 15, color: colors.text, textAlign: 'right' },
});
