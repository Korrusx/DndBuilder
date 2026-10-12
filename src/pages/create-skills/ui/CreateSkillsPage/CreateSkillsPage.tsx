import {
  choice1,
  CHOICE_KEYS,
  expertiseCount,
  FEAT_FEATURES,
  featFeatureIds,
  FEATURE_LANGUAGES,
  FEATURE_OPTIONS,
  featureLanguageSlots,
  featureName,
  featureOptionIds,
  fixedProficiencies,
  knownLanguages,
  languageOptions,
  proficiencySlots,
  proficientSkills,
  STANDARD_LANGUAGE_COUNT,
  weaponMasteryCount,
  weaponMasteryOptions,
} from '@/entities/character';
import { StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import { byId, content, nameOf, proficiencyName, tr } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Chip, ChipRow, MultiPick, Section } from '@/shared/ui';

export function CreateSkillsPage() {
  const { character: c, update, issues: allIssues } = useDraft();
  const { t } = useTranslation();
  const issues = allIssues.filter((i) => i.step === 4);
  const setChoice = (key: string, ids: string[]) => update((d) => ({ ...d, choices: { ...d.choices, [key]: ids } }));

  const fixed = fixedProficiencies(c, content);
  const slots = proficiencySlots(c, content);
  const fixedSkills = fixed.filter((f) => f.id.startsWith('skill-'));
  const otherFixed = fixed.filter((f) => !f.id.startsWith('skill-'));

  // Что уже есть: выдано без выбора или выбрано в другом разделе — второй раз не выбирается.
  const blockedFor = (key: string) => {
    const m = new Map<string, string>();
    for (const f of fixed) m.set(f.id, f.source === 'class' ? t('skillsStep.fromClass') : t('skillsStep.fromBackground'));
    for (const s of slots) if (s.key !== key) for (const id of c.choices[s.key] ?? []) m.set(id, t('skillsStep.alreadyChosen'));
    return m;
  };

  const expCount = expertiseCount(c, content);
  const skillsForExpertise = proficientSkills(c, content);
  const masteryCount = weaponMasteryCount(c, content);
  const languages = c.languages.filter((l) => l !== 'common');
  const languageSlots = featureLanguageSlots(c, content);
  const slotLanguages = new Set(languageSlots.flatMap((s) => c.choices[s.key] ?? []));
  const classLanguages = knownLanguages(c, content).filter((id) => id !== 'common' && !c.languages.includes(id) && !slotLanguages.has(id));

  return (
    <WizardScreen step={4} canContinue={issues.every((i) => !i.blocking)} summary={<StepStatus issues={issues.filter((i) => i.blocking)} />}>
      {fixedSkills.length ? (
        <AppText variant="secondary">{t('skillsStep.alreadyHave', { list: fixedSkills.map((f) => proficiencyName(f.id)).join(', ') })}</AppText>
      ) : null}

      {slots.map((slot) => (
        <Section
          key={slot.key}
          title={t('skillsStep.slotTitle', {
            source: t(`skillsStep.source.${slot.source}`),
            what: slot.options.every((o) => o.startsWith('skill-')) ? t('skillsStep.skills') : t('skillsStep.proficiencies'),
          })}
          hint={tr(slot.desc).text}
          picked={c.choices[slot.key]?.length ?? 0}
          need={slot.choose}
        >
          <MultiPick
            options={slot.options}
            selected={c.choices[slot.key] ?? []}
            max={slot.choose}
            label={proficiencyName}
            blocked={blockedFor(slot.key)}
            onChange={(ids) => setChoice(slot.key, ids)}
          />
        </Section>
      ))}

      {expCount ? (
        <Section title={t('skillsStep.expertise')} hint={t('skillsStep.expertiseHint')} picked={c.expertise.length} need={expCount}>
          <MultiPick
            options={skillsForExpertise}
            selected={c.expertise.filter((s) => skillsForExpertise.includes(s))}
            max={expCount}
            label={(id) => nameOf('skills', id)}
            onChange={(expertise) => update((d) => ({ ...d, expertise }))}
          />
        </Section>
      ) : null}

      {featureOptionIds(c, content).map((featureId) => {
        const chosen = choice1(c, CHOICE_KEYS.featureOption(featureId));
        return (
          <Section key={featureId} title={nameOf('features', featureId)} picked={chosen ? 1 : 0} need={1}>
            <ChipRow>
              {FEATURE_OPTIONS[featureId].map((o) => (
                <Chip
                  key={o.id}
                  label={tr(o.name).text}
                  note={tr(o.description).text}
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
            </ChipRow>
          </Section>
        );
      })}

      {featFeatureIds(c, content).map((featureId) => {
        const type = FEAT_FEATURES[featureId];
        const chosen = c.feats.find((f) => f.source === 'class' && byId.feats.get(f.featId)?.type === type);
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
          picked={c.weaponMasteries.length}
          need={masteryCount}
        >
          <MultiPick
            options={weaponMasteryOptions(c, content)}
            selected={c.weaponMasteries}
            max={masteryCount}
            label={(id) => nameOf('equipment', id)}
            onChange={(weaponMasteries) => update((d) => ({ ...d, weaponMasteries }))}
          />
        </Section>
      ) : null}

      <Section
        title={t('skillsStep.languages')}
        hint={t('skillsStep.languagesHint', { count: STANDARD_LANGUAGE_COUNT })}
        picked={languages.length}
        need={STANDARD_LANGUAGE_COUNT}
      >
        <MultiPick
          options={languageOptions(content).filter((id) => !slotLanguages.has(id) && !classLanguages.includes(id))}
          selected={languages}
          max={STANDARD_LANGUAGE_COUNT}
          label={(id) => nameOf('languages', id)}
          onChange={(ids) => update((d) => ({ ...d, languages: ['common', ...ids] }))}
        />
        {classLanguages.length ? (
          <AppText variant="secondary">{t('skillsStep.classLanguages', { list: classLanguages.map((id) => nameOf('languages', id)).join(', ') })}</AppText>
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
          picked={(c.choices[slot.key] ?? []).length}
          need={slot.choose}
        >
          <MultiPick
            options={slot.options}
            selected={c.choices[slot.key] ?? []}
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
