import { View } from 'react-native';

import { choice1, CHOICE_KEYS, needsSpeciesSpellAbility, originFeats, setBackground, setSpecies, SPECIES_SPELL_ABILITIES } from '@/entities/character';
import { StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import { abilityAbbr, abilityName, byId, content, nameOf, proficiencyName, sizeName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatFeet } from '@/shared/lib/dice';
import { AppText, Chip, ChipRow, OptionCard, Section } from '@/shared/ui';

import { DEFAULT_SPECIES_ICON, SPECIES_ICONS } from '../../config/icons';
import { styles } from './CreateOriginPage.styles';

export function CreateOriginPage() {
  const { character: c, update, issues: allIssues } = useDraft();
  const { t } = useTranslation();
  const species = byId.species.get(c.speciesId);
  const background = byId.backgrounds.get(c.backgroundId);
  const versatile = originFeats(c, content).find((f) => f.slot === 'versatile');
  const issues = allIssues.filter((i) => i.step === 2);
  const speciesRows: (typeof content.species)[] = [];
  for (let i = 0; i < content.species.length; i += 2) speciesRows.push(content.species.slice(i, i + 2));

  return (
    <WizardScreen
      step={2}
      canContinue={issues.length === 0}
      summary={<StepStatus issues={issues} />}
    >
      <Section title={t('origin.background')} hint={t('origin.backgroundHint')}>
        <ChipRow>
          {content.backgrounds.map((b) => (
            <Chip
              key={b.id}
              label={nameOf('backgrounds', b.id)}
              selected={b.id === c.backgroundId}
              onPress={() => update((d) => setBackground(d, b.id))}
            />
          ))}
        </ChipRow>
      </Section>

      {background ? (
        <OptionCard
          title={nameOf('backgrounds', background.id)}
          lines={[
            t('origin.abilities', { list: background.abilities.map(abilityAbbr).join(', ') }),
            t('origin.feat', { name: `${nameOf('feats', background.featId)}${background.featSpellList ? ` (${nameOf('classes', background.featSpellList)})` : ''}` }),
            `${t('origin.proficiencies', { list: background.proficiencies.map(proficiencyName).join(', ') })}${background.proficiencyChoices.length ? t('origin.plusChoice') : ''}`,
            ...(background.extra ? [t('common.fromPhb')] : []),
          ]}
        />
      ) : null}

      <Section title={t('origin.species')}>
        <View style={styles.grid}>
          {speciesRows.map((row) => (
            <View key={row[0].id} style={styles.row}>
              {row.map((s) => (
                <OptionCard
                  key={s.id}
                  compact
                  icon={SPECIES_ICONS[s.id] ?? DEFAULT_SPECIES_ICON}
                  selected={s.id === c.speciesId}
                  onPress={() => update((d) => setSpecies(d, s.id, content))}
                  title={
                    <AppText style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
                      {nameOf('species', s.id)}
                    </AppText>
                  }
                  lines={[formatFeet(s.speed)]}
                />
              ))}
            </View>
          ))}
        </View>
      </Section>

      {species ? (
        <OptionCard
          title={nameOf('species', species.id)}
          lines={[
            t('origin.speedSize', { speed: formatFeet(species.speed), sizes: species.sizes.map(sizeName).join(` ${t('common.or')} `) }),
            t('origin.traits', { list: species.traits.map((id) => nameOf('traits', id)).join(', ') }),
          ]}
        />
      ) : null}

      {species && species.subspecies.length > 0 ? (
        <Section title={t('origin.subspecies')} hint={t('origin.subspeciesHint')}>
          <ChipRow>
            {species.subspecies.map((id) => (
              <Chip
                key={id}
                label={nameOf('subspecies', id)}
                selected={id === c.subspeciesId}
                onPress={() => update((d) => ({ ...d, subspeciesId: id }))}
              />
            ))}
          </ChipRow>
        </Section>
      ) : null}

      {needsSpeciesSpellAbility(c, content) ? (
        <Section title={t('origin.spellAbility')} hint={t('origin.spellAbilityHint')}>
          <ChipRow>
            {SPECIES_SPELL_ABILITIES.map((ability) => (
              <Chip
                key={ability}
                label={abilityName(ability)}
                selected={choice1(c, CHOICE_KEYS.speciesSpellAbility) === ability}
                onPress={() => update((d) => ({ ...d, choices: { ...d.choices, [CHOICE_KEYS.speciesSpellAbility]: [ability] } }))}
              />
            ))}
          </ChipRow>
        </Section>
      ) : null}

      {species && species.sizes.length > 1 ? (
        <Section title={t('origin.size')}>
          <ChipRow>
            {species.sizes.map((size) => (
              <Chip
                key={size}
                label={sizeName(size)}
                selected={c.size === size}
                onPress={() => update((d) => ({ ...d, size }))}
              />
            ))}
          </ChipRow>
        </Section>
      ) : null}

      {versatile ? (
        <Section title={t('origin.versatile')} hint={t('origin.versatileHint')}>
          <ChipRow>
            {content.feats
              .filter((f) => f.type === 'origin')
              .map((f) => (
                <Chip
                  key={f.id}
                  label={nameOf('feats', f.id)}
                  selected={versatile.featId === f.id}
                  onPress={() =>
                    update((d) => {
                      // Выборы прежней черты (навыки, заклинания) больше не нужны.
                      const choices = Object.fromEntries(Object.entries(d.choices).filter(([k]) => !k.startsWith('versatile.')));
                      return { ...d, choices: { ...choices, [CHOICE_KEYS.versatileFeat]: [f.id] } };
                    })
                  }
                />
              ))}
          </ChipRow>
        </Section>
      ) : null}
    </WizardScreen>
  );
}
