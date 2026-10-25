import {
  choice1,
  CHOICE_KEYS,
  expertiseCount,
  FEAT_FEATURES,
  featFeatureIds,
  FEATURE_LANGUAGES,
  FEATURE_OPTIONS,
  featureChoices,
  featureLanguageSlots,
  featureName,
  featureOptionIds,
  fixedProficiencies,
  knownLanguages,
  languageChoiceCount,
  languageChoiceOptions,
  proficiencySlots,
  proficientSkills,
  weaponMasteryCount,
  weaponMasteryOptions,
} from '@/entities/character';
import { StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import { ClassOptionsPicker } from '@/features/pick-class-options';
import { byId, content, nameOf, proficiencyName, localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, MultiPick, OptionCard, Section } from '@/shared/ui';

export function CreateSkillsPage() {
  const { character, update, issues: allIssues } = useDraft();
  const { t } = useTranslation();
  const issues = allIssues.filter((i) => i.step === 4);
  const setChoice = (key: string, ids: string[]) => update((d) => ({ ...d, choices: { ...d.choices, [key]: ids } }));

  const fixed = fixedProficiencies(character, content);
  const slots = proficiencySlots(character, content);
  const fixedSkills = fixed.filter((f) => f.id.startsWith('skill-'));
  const otherFixed = fixed.filter((f) => !f.id.startsWith('skill-'));

  // Что уже есть: выдано без выбора или выбрано в другом разделе — второй раз не выбирается.
  const blockedFor = (key: string) => {
    const m = new Map<string, string>();
    const from = {
      class: t('skillsStep.fromClass'),
      background: t('skillsStep.fromBackground'),
      species: t('skillsStep.fromSpecies'),
    };
    for (const f of fixed) {
      m.set(f.id, from[f.source]);
    }
    for (const s of slots) {
      if (s.key !== key) {
        for (const id of character.choices[s.key] ?? []) {
          m.set(id, t('skillsStep.alreadyChosen'));
        }
      }
    }
    return m;
  };

  const expCount = expertiseCount(character, content);
  const skillsForExpertise = proficientSkills(character, content);
  const masteryCount = weaponMasteryCount(character, content);
  const languages = character.languages.filter((l) => l !== 'common');
  const languageSlots = featureLanguageSlots(character, content);
  const slotLanguages = new Set(languageSlots.flatMap((s) => character.choices[s.key] ?? []));
  const classLanguages = knownLanguages(character, content).filter(
    (id) => id !== 'common' && !character.languages.includes(id) && !slotLanguages.has(id),
  );
  const languageCount = languageChoiceCount(character, content);

  return (
    <WizardScreen
      step={4}
      canContinue={issues.every((i) => !i.blocking)}
      summary={<StepStatus issues={issues.filter((i) => i.blocking)} />}
    >
      {fixedSkills.length ? (
        <AppText variant="secondary">
          {t('skillsStep.alreadyHave', { list: fixedSkills.map((f) => proficiencyName(f.id)).join(', ') })}
        </AppText>
      ) : null}

      {slots.map((slot) => (
        <Section
          key={slot.key}
          title={t('skillsStep.slotTitle', {
            source: t(`skillsStep.source.${slot.source}`),
            what: slot.options.every((o) => o.startsWith('skill-'))
              ? t('skillsStep.skills')
              : t('skillsStep.proficiencies'),
          })}
          hint={localizeText(slot.desc).text}
          picked={character.choices[slot.key]?.length ?? 0}
          need={slot.choose}
        >
          <MultiPick
            options={slot.options}
            selected={character.choices[slot.key] ?? []}
            max={slot.choose}
            label={proficiencyName}
            blocked={blockedFor(slot.key)}
            onChange={(ids) => setChoice(slot.key, ids)}
          />
        </Section>
      ))}

      {expCount ? (
        <Section
          title={t('skillsStep.expertise')}
          hint={t('skillsStep.expertiseHint')}
          picked={character.expertise.length}
          need={expCount}
        >
          <MultiPick
            options={skillsForExpertise}
            selected={character.expertise.filter((s) => skillsForExpertise.includes(s))}
            max={expCount}
            label={(id) => nameOf('skills', id)}
            onChange={(expertise) => update((d) => ({ ...d, expertise }))}
          />
        </Section>
      ) : null}

      {featureOptionIds(character, content).map((featureId) => {
        const chosen = choice1(character, CHOICE_KEYS.featureOption(featureId));
        return (
          <Section key={featureId} title={nameOf('features', featureId)} picked={chosen ? 1 : 0} need={1}>
            {FEATURE_OPTIONS[featureId].map((o) => (
              <OptionCard
                key={o.id}
                title={localizeText(o.name).text}
                lines={[localizeText(o.description).text]}
                selected={chosen === o.id}
                onPress={() =>
                  update((d) => ({
                    ...d,
                    choices: { ...d.choices, [CHOICE_KEYS.featureOption(featureId)]: [o.id] },
                    // Число заговоров могло измениться — выбор заговоров начинается заново.
                    cantrips: [],
                  }))
                }
              />
            ))}
          </Section>
        );
      })}

      {featureChoices(character, content).map((f) => (
        <Section
          key={f.featureId}
          title={nameOf('features', f.featureId)}
          picked={(character.choices[CHOICE_KEYS.featureOption(f.featureId)] ?? []).length}
          need={f.choose}
        >
          <MultiPick
            options={f.options}
            selected={character.choices[CHOICE_KEYS.featureOption(f.featureId)] ?? []}
            max={f.choose}
            label={(id) => nameOf('features', id)}
            onChange={(ids) => setChoice(CHOICE_KEYS.featureOption(f.featureId), ids)}
          />
        </Section>
      ))}

      <ClassOptionsPicker character={character} onChoice={setChoice} />

      {featFeatureIds(character, content).map((featureId) => {
        const type = FEAT_FEATURES[featureId];
        const chosen = character.feats.find((f) => f.source === 'class' && byId.feats.get(f.featId)?.type === type);
        return (
          <Section key={featureId} title={nameOf('features', featureId)} picked={chosen ? 1 : 0} need={1}>
            <MultiPick
              options={content.feats.filter((f) => f.type === type).map((f) => f.id)}
              selected={chosen ? [chosen.featId] : []}
              max={1}
              label={(id) => nameOf('feats', id)}
              onChange={([featId]) =>
                update((d) => ({
                  ...d,
                  feats: [
                    ...d.feats.filter((f) => !(f.source === 'class' && byId.feats.get(f.featId)?.type === type)),
                    ...(featId ? [{ featId, source: 'class' as const, level: 1 }] : []),
                  ],
                }))
              }
            />
          </Section>
        );
      })}

      {masteryCount ? (
        <Section
          title={t('skillsStep.masteries')}
          hint={t('skillsStep.masteriesHint')}
          picked={character.weaponMasteries.length}
          need={masteryCount}
        >
          <MultiPick
            options={weaponMasteryOptions(character, content)}
            selected={character.weaponMasteries}
            max={masteryCount}
            label={(id) => nameOf('equipment', id)}
            onChange={(weaponMasteries) => update((d) => ({ ...d, weaponMasteries }))}
          />
        </Section>
      ) : null}

      <Section
        title={t('skillsStep.languages')}
        hint={
          character.edition === '2014'
            ? t('skillsStep.languagesHint2014', { count: languageCount })
            : t('skillsStep.languagesHint', { count: languageCount })
        }
        picked={languages.length}
        need={languageCount}
      >
        <MultiPick
          options={languageChoiceOptions(character, content).filter(
            (id) => !slotLanguages.has(id) && !classLanguages.includes(id),
          )}
          selected={languages}
          max={languageCount}
          label={(id) => nameOf('languages', id)}
          onChange={(ids) => update((d) => ({ ...d, languages: ['common', ...ids] }))}
        />
        {classLanguages.length ? (
          <AppText variant="secondary">
            {t('skillsStep.classLanguages', { list: classLanguages.map((id) => nameOf('languages', id)).join(', ') })}
          </AppText>
        ) : null}
      </Section>

      {languageSlots.map((slot) => (
        <Section
          key={slot.key}
          title={featureName({ id: slot.featureId, source: 'class' })}
          hint={t('skillsStep.featureLanguagesHint', {
            known: FEATURE_LANGUAGES[slot.featureId].known.map((id) => nameOf('languages', id)).join(', '),
            count: slot.choose,
          })}
          picked={(character.choices[slot.key] ?? []).length}
          need={slot.choose}
        >
          <MultiPick
            options={slot.options}
            selected={character.choices[slot.key] ?? []}
            max={slot.choose}
            label={(id) => nameOf('languages', id)}
            onChange={(ids) => setChoice(slot.key, ids)}
          />
        </Section>
      ))}

      {otherFixed.length ? (
        <Section title={t('skillsStep.fixed')}>
          <AppText variant="secondary">{otherFixed.map((f) => proficiencyName(f.id)).join(', ')}</AppText>
        </Section>
      ) : null}

      {issues
        .filter((i) => !i.blocking)
        .map((i) => (
          <AppText key={i.message} variant="secondary">
            {i.message}
          </AppText>
        ))}
    </WizardScreen>
  );
}
