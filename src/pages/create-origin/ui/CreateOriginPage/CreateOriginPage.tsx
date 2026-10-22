import { Fragment } from 'react';
import { View } from 'react-native';

import {
  choice1,
  CHOICE_KEYS,
  choiceOptionIds,
  needsSpeciesSpellAbility,
  originFeats,
  originTraitIds,
  setBackground,
  setSpecies,
  SPECIES_SPELL_ABILITIES,
} from '@/entities/character';
import { StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import type { AbilityId } from '@/shared/content';
import {
  abilityAbbr,
  abilityName,
  byId,
  content,
  nameOf,
  proficiencyName,
  sizeName,
  spellName,
  localizeText,
} from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatFeet } from '@/shared/lib/dice';
import { AppText, Chip, ChipRow, MultiPick, OptionCard, Section } from '@/shared/ui';

import { DEFAULT_SPECIES_ICON, SPECIES_ICONS } from '../../config/icons';
import { bonusText } from '../../lib/subspeciesText';
import { SubspeciesPanel } from '../SubspeciesPanel/SubspeciesPanel';
import { styles } from './CreateOriginPage.styles';

export function CreateOriginPage() {
  const { character, update, issues: allIssues } = useDraft();
  const { t } = useTranslation();
  const species = byId.species.get(character.speciesId);
  const background = byId.backgrounds.get(character.backgroundId);
  const versatile = originFeats(character, content).find((f) => f.slot === 'versatile');
  const issues = allIssues.filter((i) => i.step === 2);
  const is2014 = character.edition === '2014';
  const setChoice = (key: string, ids: string[]) => update((d) => ({ ...d, choices: { ...d.choices, [key]: ids } }));
  const traits = originTraitIds(character, content).flatMap((id) => byId.traits.get(id) ?? []);
  const bonusChoice = species?.abilityBonusChoice;
  const versatileFeat = versatile?.featId ? byId.feats.get(versatile.featId) : undefined;
  const speciesRows: (typeof content.species)[] = [];
  for (let i = 0; i < content.species.length; i += 2) {
    speciesRows.push(content.species.slice(i, i + 2));
  }

  return (
    <WizardScreen step={2} canContinue={issues.length === 0} summary={<StepStatus issues={issues} />}>
      <Section
        title={t('origin.background')}
        hint={is2014 ? t('origin.backgroundHint2014') : t('origin.backgroundHint')}
      >
        <ChipRow>
          {content.backgrounds.map((b) => (
            <Chip
              key={b.id}
              label={nameOf('backgrounds', b.id)}
              selected={b.id === character.backgroundId}
              onPress={() => update((d) => setBackground(d, b.id))}
            />
          ))}
        </ChipRow>
      </Section>

      {background ? (
        <OptionCard
          title={nameOf('backgrounds', background.id)}
          lines={[
            ...(background.abilities.length
              ? [t('origin.abilities', { list: background.abilities.map(abilityAbbr).join(', ') })]
              : []),
            ...(background.featId
              ? [
                  t('origin.feat', {
                    name: `${nameOf('feats', background.featId)}${background.featSpellList ? ` (${nameOf('classes', background.featSpellList)})` : ''}`,
                  }),
                ]
              : []),
            ...(background.feature ? [t('origin.feature', { name: localizeText(background.feature.name).text })] : []),
            `${t('origin.proficiencies', { list: background.proficiencies.map(proficiencyName).join(', ') })}${background.proficiencyChoices.length ? t('origin.plusChoice') : ''}`,
            ...(background.languageChoice
              ? [t('origin.languagesChoice', { count: background.languageChoice.choose })]
              : []),
            ...(background.extra ? [t('common.fromPhb')] : []),
          ]}
        />
      ) : null}

      <Section title={is2014 ? t('origin.race') : t('origin.species')}>
        <View style={styles.grid}>
          {speciesRows.map((row) => (
            <Fragment key={row[0].id}>
              <View style={styles.row}>
                {row.map((s) => (
                  <OptionCard
                    key={s.id}
                    compact
                    pattern
                    icon={SPECIES_ICONS[s.id] ?? DEFAULT_SPECIES_ICON}
                    selected={s.id === character.speciesId}
                    onPress={() => update((d) => setSpecies(d, s.id, content))}
                    title={
                      <AppText style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
                        {nameOf('species', s.id)}
                      </AppText>
                    }
                    lines={[
                      s.subspecies.length
                        ? `${formatFeet(s.speed)} · ${t('origin.variants', { count: s.subspecies.length })}`
                        : formatFeet(s.speed),
                    ]}
                  />
                ))}
                {row.length === 1 ? <View style={styles.fill} /> : null}
              </View>
              {species && species.subspecies.length > 0 && row.some((s) => s.id === species.id) ? (
                <SubspeciesPanel
                  species={species}
                  selectedId={character.subspeciesId}
                  onSelect={(id) => update((d) => ({ ...d, subspeciesId: id }))}
                  hint={is2014 ? t('origin.subraceHint') : t('origin.subspeciesHint')}
                />
              ) : null}
            </Fragment>
          ))}
        </View>
      </Section>

      {species ? (
        <OptionCard
          title={nameOf('species', species.id)}
          lines={[
            t('origin.speedSize', {
              speed: formatFeet(species.speed),
              sizes: species.sizes.map(sizeName).join(` ${t('common.or')} `),
            }),
            ...(species.abilityBonuses ? [t('origin.raceBonuses', { list: bonusText(species.abilityBonuses) })] : []),
            ...(species.languages
              ? [t('origin.languages', { list: species.languages.map((id) => nameOf('languages', id)).join(', ') })]
              : []),
            t('origin.traits', { list: species.traits.map((id) => nameOf('traits', id)).join(', ') }),
          ]}
        />
      ) : null}

      {bonusChoice ? (
        <Section
          title={t('origin.bonusChoice')}
          hint={t('origin.bonusChoiceHint', { bonus: bonusChoice.bonus, count: bonusChoice.choose })}
          picked={(character.choices[CHOICE_KEYS.speciesAbilityBonus] ?? []).length}
          need={bonusChoice.choose}
        >
          <MultiPick
            options={bonusChoice.options}
            selected={character.choices[CHOICE_KEYS.speciesAbilityBonus] ?? []}
            max={bonusChoice.choose}
            label={(id) => abilityName(id as AbilityId)}
            onChange={(ids) => setChoice(CHOICE_KEYS.speciesAbilityBonus, ids)}
          />
        </Section>
      ) : null}

      {traits
        .filter((trait) => trait.subtraits)
        .map((trait) => (
          <Section
            key={trait.id}
            title={localizeText(trait.name).text}
            picked={choice1(character, CHOICE_KEYS.traitOption(trait.id)) ? 1 : 0}
            need={1}
          >
            <MultiPick
              options={trait.subtraits!}
              selected={character.choices[CHOICE_KEYS.traitOption(trait.id)] ?? []}
              max={1}
              label={(id) => nameOf('traits', id)}
              onChange={(ids) => setChoice(CHOICE_KEYS.traitOption(trait.id), ids)}
            />
          </Section>
        ))}

      {traits
        .filter((trait) => trait.spellChoice)
        .map((trait) => (
          <Section
            key={trait.id}
            title={t('origin.traitSpell', { name: localizeText(trait.name).text })}
            picked={(character.choices[CHOICE_KEYS.traitSpell(trait.id)] ?? []).length}
            need={trait.spellChoice!.choose}
          >
            <MultiPick
              options={choiceOptionIds(trait.spellChoice!, content)}
              selected={character.choices[CHOICE_KEYS.traitSpell(trait.id)] ?? []}
              max={trait.spellChoice!.choose}
              label={spellName}
              onChange={(ids) => setChoice(CHOICE_KEYS.traitSpell(trait.id), ids)}
            />
          </Section>
        ))}

      {versatileFeat?.abilityIncrease ? (
        <Section
          title={t('origin.featAbility')}
          picked={choice1(character, CHOICE_KEYS.versatileAbility) ? 1 : 0}
          need={1}
        >
          <ChipRow>
            {versatileFeat.abilityIncrease.abilities.map((ability) => (
              <Chip
                key={ability}
                label={`${abilityName(ability)} +1`}
                selected={choice1(character, CHOICE_KEYS.versatileAbility) === ability}
                onPress={() => setChoice(CHOICE_KEYS.versatileAbility, [ability])}
              />
            ))}
          </ChipRow>
        </Section>
      ) : null}

      {needsSpeciesSpellAbility(character, content) ? (
        <Section title={t('origin.spellAbility')} hint={t('origin.spellAbilityHint')}>
          <ChipRow>
            {SPECIES_SPELL_ABILITIES.map((ability) => (
              <Chip
                key={ability}
                label={abilityName(ability)}
                selected={choice1(character, CHOICE_KEYS.speciesSpellAbility) === ability}
                onPress={() =>
                  update((d) => ({ ...d, choices: { ...d.choices, [CHOICE_KEYS.speciesSpellAbility]: [ability] } }))
                }
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
                selected={character.size === size}
                onPress={() => update((d) => ({ ...d, size }))}
              />
            ))}
          </ChipRow>
        </Section>
      ) : null}

      {versatile ? (
        <Section
          title={is2014 ? t('origin.variantFeat') : t('origin.versatile')}
          hint={is2014 ? t('origin.variantFeatHint') : t('origin.versatileHint')}
        >
          <ChipRow>
            {content.feats
              // 2014: любая черта (кроме «Увеличения характеристик»); 2024 — черта происхождения.
              .filter((f) =>
                is2014 ? f.type === 'general' && f.id !== 'ability-score-improvement' : f.type === 'origin',
              )
              .map((f) => (
                <Chip
                  key={f.id}
                  label={nameOf('feats', f.id)}
                  selected={versatile.featId === f.id}
                  onPress={() =>
                    update((d) => {
                      // Выборы прежней черты (навыки, заклинания) больше не нужны.
                      const choices = Object.fromEntries(
                        Object.entries(d.choices).filter(([k]) => !k.startsWith('versatile.')),
                      );
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
