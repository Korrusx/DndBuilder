import { View } from 'react-native';

import { ABILITY_IDS, attackName, featureName, featureSourceLabel, knownLanguages, speciesSpellcasting } from '@/entities/character';
import { colors } from '@/shared/config';
import {
  abilityAbbr,
  abilityName,
  coinsText,
  content,
  groupSkillsByAbility,
  nameOf,
  proficiencyName,
  spellName,
} from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDamage, formatFeet, formatModifier } from '@/shared/lib/dice';
import { AppText, Section } from '@/shared/ui';

import { Grid } from '../Grid/Grid';
import { Stat } from '../Stat/Stat';
import { styles } from './SheetPreview.styles';
import type { SheetPreviewProps } from './SheetPreview.types';

export function SheetPreview({ c, sheet }: SheetPreviewProps) {
  const { t } = useTranslation();
  const speciesSpells = speciesSpellcasting(c, content, sheet);
  const main = [
    { label: t('stats.hp'), value: String(sheet.maxHp) },
    { label: t('stats.ac'), value: String(sheet.armorClass) },
    { label: t('stats.initiative'), value: formatModifier(sheet.initiative) },
    { label: t('stats.speed'), value: formatFeet(sheet.speed) },
    { label: t('stats.profBonus'), value: formatModifier(sheet.profBonus) },
    { label: t('stats.passivePerception'), value: String(sheet.passivePerception) },
  ];
  return (
    <>
      <Grid>
        {main.map((m) => (
          <Stat key={m.label} label={m.label} value={m.value} />
        ))}
      </Grid>

      <Section title={t('preview.abilities')}>
        <Grid>
          {ABILITY_IDS.map((id) => {
            const a = sheet.abilities[id];
            return (
              <Stat
                key={id}
                label={abilityAbbr(id)}
                value={formatModifier(a.mod)}
                note={`${t('preview.save', { score: a.score, save: formatModifier(a.save) })}${a.saveProficient ? ' ●' : ''}`}
              />
            );
          })}
        </Grid>
      </Section>

      <Section title={t('preview.skills')} hint={t('preview.legend')}>
        <View style={styles.card}>
          {groupSkillsByAbility(sheet.skills).map(({ ability, skills }) => (
            <View key={ability} style={styles.padVXs}>
              <AppText style={styles.groupTitle}>{abilityName(ability)}</AppText>
              {skills.map((s) => (
                <View key={s.id} style={styles.line}>
                  <AppText style={styles.profMark}>{s.expertise ? '◆' : s.proficient ? '●' : ''}</AppText>
                  <AppText style={{ flex: 1, color: s.proficient ? colors.text : colors.textSecondary }}>{nameOf('skills', s.id)}</AppText>
                  <AppText style={styles.num}>{formatModifier(s.bonus)}</AppText>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Section>

      {sheet.attacks.length ? (
        <Section title={t('preview.attacks')}>
          <View style={styles.card}>
            {sheet.attacks.map((a) => (
              <View key={a.key} style={styles.line}>
                <AppText style={styles.fill}>{attackName(a)}</AppText>
                <AppText style={[styles.num, { width: 48 }]}>{formatModifier(a.toHit)}</AppText>
                <AppText style={[styles.num, { width: 80 }]}>{formatDamage(a.damageDice, a.damageBonus)}</AppText>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {c.cantrips.length || c.preparedSpells.length ? (
        <Section title={t('preview.spells')}>
          {sheet.spellcasting ? (
            <AppText variant="secondary">
              {t('preview.spellStats', { dc: sheet.spellcasting.saveDC, attack: formatModifier(sheet.spellcasting.attackBonus) })}
            </AppText>
          ) : null}
          <AppText>{[...c.cantrips, ...c.preparedSpells].map(spellName).join(', ')}</AppText>
        </Section>
      ) : null}

      {speciesSpells ? (
        <Section title={t('magic.species')}>
          {speciesSpells.ability ? (
            <AppText variant="secondary">
              {t('magic.speciesStats', { ability: abilityAbbr(speciesSpells.ability), dc: speciesSpells.saveDC, attack: formatModifier(speciesSpells.attackBonus ?? 0) })}
            </AppText>
          ) : null}
          <AppText>{speciesSpells.spells.map((s) => spellName(s.spellId)).join(', ')}</AppText>
        </Section>
      ) : null}

      <Section title={t('preview.features')}>
        <View style={styles.card}>
          {sheet.features.map((f) => (
            <View key={`${f.source}-${f.id}`} style={styles.line}>
              <AppText style={styles.fill}>{featureName(f)}</AppText>
              <AppText variant="secondary">{featureSourceLabel(f.source)}</AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title={t('preview.proficiencies')}>
        <AppText variant="secondary">
          {sheet.proficiencies
            .filter((id) => !id.startsWith('skill-'))
            .map(proficiencyName)
            .join(', ') || '—'}
        </AppText>
        <AppText variant="secondary">{t('preview.languages', { list: knownLanguages(c, content).map((l) => nameOf('languages', l)).join(', ') })}</AppText>
        <AppText variant="secondary">{t('preview.coins', { list: coinsText(c.coins) || '—' })}</AppText>
      </Section>
    </>
  );
}
