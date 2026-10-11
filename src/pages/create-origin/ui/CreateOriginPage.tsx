import { CHOICE_KEYS } from '@/entities/character/config/constants';
import { originFeats, setBackground, setSpecies } from '@/entities/character/model/build';
import { useDraft } from '@/features/create-character/model/DraftContext';
import { draftIssues } from '@/features/create-character/model/validation';
import { StepStatus } from '@/features/create-character/ui/StepStatus/StepStatus';
import { WizardScreen } from '@/features/create-character/ui/WizardScreen/WizardScreen';
import { SIZE_NAMES } from '@/shared/content/constants';
import { content } from '@/shared/content/content';
import { abilityAbbr, nameOf, proficiencyName } from '@/shared/content/names';
import { Chip } from '@/shared/ui/Chip/Chip';
import { ChipRow } from '@/shared/ui/ChipRow/ChipRow';
import { OptionCard } from '@/shared/ui/OptionCard/OptionCard';
import { Section } from '@/shared/ui/Section/Section';

export function CreateOriginPage() {
  const { character: c, update } = useDraft();
  const species = content.species.find((s) => s.id === c.speciesId);
  const background = content.backgrounds.find((b) => b.id === c.backgroundId);
  const versatile = originFeats(c, content).find((f) => f.slot === 'versatile');
  const issues = draftIssues(c, content).filter((i) => i.step === 2);

  return (
    <WizardScreen
      step={2}
      canContinue={issues.length === 0}
      summary={<StepStatus issues={issues} />}
    >
      <Section title="Предыстория" hint="Даёт бонусы к трём характеристикам, черту, навыки и снаряжение.">
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
            `Характеристики: ${background.abilities.map(abilityAbbr).join(', ')}`,
            `Черта: ${nameOf('feats', background.featId)}${background.featSpellList ? ` (${nameOf('classes', background.featSpellList)})` : ''}`,
            `Владения: ${background.proficiencies.map(proficiencyName).join(', ')}${background.proficiencyChoices.length ? ' + на выбор' : ''}`,
            ...(background.extra ? ['Из Player\'s Handbook 2024 (не SRD)'] : []),
          ]}
        />
      ) : null}

      <Section title="Вид">
        <ChipRow>
          {content.species.map((s) => (
            <Chip
              key={s.id}
              label={nameOf('species', s.id)}
              selected={s.id === c.speciesId}
              onPress={() => update((d) => setSpecies(d, s.id, content))}
            />
          ))}
        </ChipRow>
      </Section>

      {species ? (
        <OptionCard
          title={nameOf('species', species.id)}
          lines={[
            `Скорость ${species.speed} фт · ${species.sizes.map((x) => SIZE_NAMES[x] ?? x).join(' или ')}`,
            `Особенности: ${species.traits.map((t) => nameOf('traits', t)).join(', ')}`,
          ]}
        />
      ) : null}

      {species && species.subspecies.length > 0 ? (
        <Section title="Происхождение" hint="Родословная, предок или наследие — выберите одно.">
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

      {species && species.sizes.length > 1 ? (
        <Section title="Размер">
          <ChipRow>
            {species.sizes.map((size) => (
              <Chip
                key={size}
                label={SIZE_NAMES[size] ?? size}
                selected={c.size === size}
                onPress={() => update((d) => ({ ...d, size }))}
              />
            ))}
          </ChipRow>
        </Section>
      ) : null}

      {versatile ? (
        <Section title="Универсальность" hint="Человек получает ещё одну черту происхождения. Рекомендуется «Одарённый».">
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
