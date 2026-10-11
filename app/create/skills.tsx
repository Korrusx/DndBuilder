import { AppText } from '@/components/AppText';
import { useDraft } from '@/components/wizard/DraftContext';
import { nameOf, proficiencyName } from '@/components/wizard/names';
import { Chip, ChipRow, MultiPick, Section, StepStatus, WizardScreen } from '@/components/wizard/ui';
import { content, tr } from '@/content';
import { CHOICE_KEYS, choice1, FEAT_FEATURES, FEATURE_OPTIONS, STANDARD_LANGUAGE_COUNT } from '@/rules/choices';
import {
  draftIssues,
  expertiseCount,
  featFeatureIds,
  featureOptionIds,
  fixedProficiencies,
  languageOptions,
  proficiencySlots,
  proficientSkills,
  weaponMasteryCount,
  weaponMasteryOptions,
} from '@/rules/creation';

const SOURCE_TITLE = { class: 'Класс', background: 'Предыстория', species: 'Вид', feat: 'Черта' } as const;

export default function CreateSkillsScreen() {
  const { character: c, update } = useDraft();
  const issues = draftIssues(c, content).filter((i) => i.step === 4);
  const setChoice = (key: string, ids: string[]) => update((d) => ({ ...d, choices: { ...d.choices, [key]: ids } }));

  const fixed = fixedProficiencies(c, content);
  const slots = proficiencySlots(c, content);
  const fixedSkills = fixed.filter((f) => f.id.startsWith('skill-'));
  const otherFixed = fixed.filter((f) => !f.id.startsWith('skill-'));

  // Что уже есть: выдано без выбора или выбрано в другом разделе — второй раз не выбирается.
  const blockedFor = (key: string) => {
    const m = new Map<string, string>();
    for (const f of fixed) m.set(f.id, f.source === 'class' ? 'от класса' : 'от предыстории');
    for (const s of slots) if (s.key !== key) for (const id of c.choices[s.key] ?? []) m.set(id, 'уже выбрано');
    return m;
  };

  const expCount = expertiseCount(c, content);
  const skillsForExpertise = proficientSkills(c, content);
  const masteryCount = weaponMasteryCount(c, content);
  const languages = c.languages.filter((l) => l !== 'common');

  return (
    <WizardScreen step={4} canContinue={issues.every((i) => !i.blocking)} summary={<StepStatus issues={issues.filter((i) => i.blocking)} />}>
      {fixedSkills.length ? (
        <AppText variant="secondary">Уже есть: {fixedSkills.map((f) => proficiencyName(f.id)).join(', ')}</AppText>
      ) : null}

      {slots.map((slot) => (
        <Section
          key={slot.key}
          title={`${SOURCE_TITLE[slot.source]}: ${slot.options.every((o) => o.startsWith('skill-')) ? 'навыки' : 'владения'}`}
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
        <Section title="Компетентность" hint="Бонус мастерства удваивается для этих навыков." picked={c.expertise.length} need={expCount}>
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
        const chosen = c.feats.find((f) => f.source === 'class' && content.feats.find((x) => x.id === f.featId)?.type === type);
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
                    ...d.feats.filter((f) => !(f.source === 'class' && content.feats.find((x) => x.id === f.featId)?.type === type)),
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
          title="Приёмы оружия"
          hint="Виды оружия, свойства-приёмы которых вы можете использовать. Можно менять после долгого отдыха."
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
        title="Языки"
        hint={`Общий язык знают все. Выберите ещё ${STANDARD_LANGUAGE_COUNT} стандартных.`}
        picked={languages.length}
        need={STANDARD_LANGUAGE_COUNT}
      >
        <MultiPick
          options={languageOptions(content)}
          selected={languages}
          max={STANDARD_LANGUAGE_COUNT}
          label={(id) => nameOf('languages', id)}
          onChange={(ids) => update((d) => ({ ...d, languages: ['common', ...ids] }))}
        />
      </Section>

      {otherFixed.length ? (
        <Section title="Владения без выбора">
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
