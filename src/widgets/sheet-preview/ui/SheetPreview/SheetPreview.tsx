import { View } from 'react-native';

import {
  ABILITY_IDS,
  attackName,
  chosenClassOptions,
  featureName,
  featureSourceLabel,
  knownLanguages,
  speciesSpellcasting,
} from '@/entities/character';
import {
  abilityAbbr,
  abilityName,
  byId,
  coinsText,
  content,
  groupSkillsByAbility,
  nameOf,
  proficiencyName,
  spellName,
  localizeText,
} from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDamage, formatFeet, formatModifier } from '@/shared/lib/dice';
import { AppText, Section, StatBox } from '@/shared/ui';

import { Grid } from '../Grid/Grid';
import { styles } from './SheetPreview.styles';
import type { SheetPreviewProps } from './SheetPreview.types';

export function SheetPreview({ character, sheet }: SheetPreviewProps) {
  const { t } = useTranslation();
  const speciesSpells = speciesSpellcasting(character, content, sheet);
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
          <StatBox key={m.label} label={m.label} value={m.value} style={styles.statCell} />
        ))}
      </Grid>

      <Section title={t('preview.abilities')}>
        <Grid>
          {ABILITY_IDS.map((id) => {
            const a = sheet.abilities[id];
            return (
              <StatBox
                key={id}
                label={abilityAbbr(id)}
                value={formatModifier(a.mod)}
                note={`${t('preview.save', { score: a.score, save: formatModifier(a.save) })}${a.saveProficient ? ' ●' : ''}`}
                style={styles.statCell}
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
                  <AppText style={s.proficient ? styles.skillName : styles.skillNameDim}>
                    {nameOf('skills', s.id)}
                  </AppText>
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
                <AppText style={[styles.num, styles.numW48]}>{formatModifier(a.toHit)}</AppText>
                <AppText style={[styles.num, styles.numW80]}>{formatDamage(a.damageDice, a.damageBonus)}</AppText>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {character.cantrips.length || character.preparedSpells.length ? (
        <Section title={t('preview.spells')}>
          {sheet.spellcasting ? (
            <AppText variant="secondary">
              {t('preview.spellStats', {
                dc: sheet.spellcasting.saveDC,
                attack: formatModifier(sheet.spellcasting.attackBonus),
              })}
            </AppText>
          ) : null}
          <AppText>{[...character.cantrips, ...character.preparedSpells].map(spellName).join(', ')}</AppText>
        </Section>
      ) : null}

      {speciesSpells ? (
        <Section title={t('magic.species')}>
          {speciesSpells.ability ? (
            <AppText variant="secondary">
              {t('magic.speciesStats', {
                ability: abilityAbbr(speciesSpells.ability),
                dc: speciesSpells.saveDC,
                attack: formatModifier(speciesSpells.attackBonus ?? 0),
              })}
            </AppText>
          ) : null}
          <AppText>{speciesSpells.spells.map((s) => spellName(s.spellId)).join(', ')}</AppText>
        </Section>
      ) : null}

      {(['invocation', 'metamagic'] as const).map((kind) =>
        chosenClassOptions(character, kind).length ? (
          <Section key={kind} title={t(`classOptions.${kind}`)}>
            <AppText>
              {chosenClassOptions(character, kind)
                .map((id) => localizeText(byId.classOptions.get(id)?.name).text || id)
                .join(', ')}
            </AppText>
          </Section>
        ) : null,
      )}

      <Section title={t('preview.features')}>
        <View style={styles.card}>
          {sheet.features.map((f, i) => (
            <View key={`${f.source}-${f.id}-${i}`} style={styles.line}>
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
        <AppText variant="secondary">
          {t('preview.languages', {
            list: knownLanguages(character, content)
              .map((l) => nameOf('languages', l))
              .join(', '),
          })}
        </AppText>
        <AppText variant="secondary">{t('preview.coins', { list: coinsText(character.coins) || '—' })}</AppText>
      </Section>
    </>
  );
}
