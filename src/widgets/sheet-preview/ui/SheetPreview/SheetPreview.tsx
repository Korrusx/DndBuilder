import { ABILITY_IDS, FEATURE_SOURCE_LABEL, featureName } from '@/entities/character';
import { colors, fonts, spacing } from '@/shared/config';
import { abilityAbbr, abilityName, coinsText, groupSkillsByAbility, nameOf, proficiencyName, spellName } from '@/shared/content';
import { formatDamage, formatModifier } from '@/shared/lib/dice';
import { AppText, Section } from '@/shared/ui';
import { View } from 'react-native';
import { Grid } from '../Grid/Grid';
import { Stat } from '../Stat/Stat';
import { styles } from './SheetPreview.styles';
import type { SheetPreviewProps } from './SheetPreview.types';

export function SheetPreview({ c, sheet }: SheetPreviewProps) {
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
