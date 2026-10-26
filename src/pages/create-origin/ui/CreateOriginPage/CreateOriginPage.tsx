import { Fragment } from 'react';
import { View } from 'react-native';

import {
  choice1,
  BACKGROUND_ICONS,
  backgroundsForClass,
  DEFAULT_BACKGROUND_ICON,
  CHOICE_KEYS,
  choiceOptionIds,
  describeBackground,
  describeSpecies,
  DEFAULT_SPECIES_ICON,
  needsSpeciesSpellAbility,
  originFeats,
  originTraitIds,
  setBackground,
  setSpecies,
  SPECIES_ICONS,
  SPECIES_SPELL_ABILITIES,
} from '@/entities/character';
import { BackgroundCard, SpeciesCard, SpellPickerField } from '@/entities/character/ui';
import { StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import type { AbilityId } from '@/shared/content';
import { abilityName, byId, content, nameOf, sizeName, localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatFeet } from '@/shared/lib/dice';
import { chunk } from '@/shared/lib/chunk';
import { AppText, Chip, ChipRow, FadeSwap, MultiPick, OptionCard, Section, Tile, VariantPanel } from '@/shared/ui';

import { speciesVariantTrait, variantOptions } from '../../lib/raceVariants';
import { BACKGROUND_COLUMNS, SPECIES_COLUMNS } from '../../config/constants';
import { backgroundTileLine } from '../../lib/backgroundTiles';
import { EmptyCard } from '../EmptyCard/EmptyCard';

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
  // 2014: вариант особенности расы (драконий предок) выбирается в панели под карточкой, как подраса.
  const variantTrait = species ? speciesVariantTrait(species) : undefined;
  const variants = species ? variantOptions(species) : [];
  const speciesRows = chunk(content.species, SPECIES_COLUMNS);
  const variantId = variantTrait ? choice1(character, CHOICE_KEYS.traitOption(variantTrait.id)) : undefined;
  const speciesDescription = species
    ? describeSpecies(species.id, content, { subspeciesId: character.subspeciesId, variantTraitId: variantId })
    : undefined;
  // Предыстории, подходящие классу (его основная характеристика среди трёх), — первыми.
  const classId = character.classes[0]?.classId;
  const backgroundDescription = background ? describeBackground(background.id, content, classId) : undefined;
  const classDative = classId ? localizeText(byId.classes.get(classId)?.dative).text : undefined;
  const { fitting, other } = backgroundsForClass(content, classId);
  const backgroundGroups = fitting.length
    ? [
        { key: 'fitting', title: t('describe.fitting'), ids: fitting, fitting: true },
        { key: 'other', title: t('describe.otherBackgrounds'), ids: other, fitting: false },
      ]
    : [{ key: 'all', title: '', ids: other, fitting: false }];

  return (
    <WizardScreen step={2} canContinue={issues.length === 0} summary={<StepStatus issues={issues} />}>
      <Section
        title={t('origin.background')}
        hint={is2014 ? t('origin.backgroundHint2014') : t('origin.backgroundHint')}
      >
        {backgroundGroups.map((group) => (
          <View key={group.key} style={styles.grid}>
            {group.title ? (
              <AppText variant="secondary" style={styles.groupTitle}>
                {group.title}
              </AppText>
            ) : null}
            {chunk(group.ids, BACKGROUND_COLUMNS).map((row) => (
              <View key={row[0]} style={styles.row}>
                {row.map((id) => {
                  const b = byId.backgrounds.get(id)!;
                  return (
                    <Tile
                      key={id}
                      title={nameOf('backgrounds', id)}
                      subtitle={backgroundTileLine(b)}
                      tag={group.fitting ? t('describe.fitsShort') : undefined}
                      icon={BACKGROUND_ICONS[id] ?? DEFAULT_BACKGROUND_ICON}
                      selected={id === character.backgroundId}
                      onPress={() => update((d) => setBackground(d, id))}
                    />
                  );
                })}
                {Array.from({ length: BACKGROUND_COLUMNS - row.length }, (_, i) => (
                  <View key={i} style={styles.fill} />
                ))}
              </View>
            ))}
          </View>
        ))}
      </Section>

      <FadeSwap swapKey={character.backgroundId}>
        {backgroundDescription ? (
          <BackgroundCard description={backgroundDescription} classDative={classDative} />
        ) : (
          <EmptyCard text={t('describe.emptyBackground')} />
        )}
      </FadeSwap>

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
                      variantOptions(s).length
                        ? `${formatFeet(s.speed)} · ${t('origin.variants', { count: variantOptions(s).length })}`
                        : formatFeet(s.speed),
                    ]}
                  />
                ))}
                {row.length === 1 ? <View style={styles.fill} /> : null}
              </View>
              {species && variants.length > 0 && row.some((s) => s.id === species.id) ? (
                <VariantPanel
                  options={variants}
                  selectedId={
                    variantTrait ? choice1(character, CHOICE_KEYS.traitOption(variantTrait.id)) : character.subspeciesId
                  }
                  onSelect={(id) =>
                    variantTrait
                      ? setChoice(CHOICE_KEYS.traitOption(variantTrait.id), [id])
                      : update((d) => ({ ...d, subspeciesId: id }))
                  }
                  hint={is2014 ? t('origin.subraceHint') : t('origin.subspeciesHint')}
                />
              ) : null}
            </Fragment>
          ))}
        </View>
      </Section>

      <FadeSwap swapKey={`${character.speciesId}:${character.subspeciesId ?? ''}:${variantId ?? ''}`}>
        {speciesDescription ? (
          <SpeciesCard description={speciesDescription} />
        ) : (
          <EmptyCard text={is2014 ? t('describe.emptyRace') : t('describe.emptySpecies')} />
        )}
      </FadeSwap>

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
        .filter((trait) => trait.subtraits && trait.id !== variantTrait?.id)
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
          <SpellPickerField
            key={trait.id}
            title={t('origin.traitSpell', { name: localizeText(trait.name).text })}
            buttonLabel={trait.spellChoice!.choose > 1 ? t('picker.chooseSpells') : t('picker.chooseSpell')}
            options={choiceOptionIds(trait.spellChoice!, content)}
            selected={character.choices[CHOICE_KEYS.traitSpell(trait.id)] ?? []}
            max={trait.spellChoice!.choose}
            character={character}
            onChange={(ids) => setChoice(CHOICE_KEYS.traitSpell(trait.id), ids)}
          />
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
