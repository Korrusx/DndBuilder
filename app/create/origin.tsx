import { useDraft } from '@/components/wizard/DraftContext';
import { abilityAbbr, nameOf, proficiencyName } from '@/components/wizard/names';
import { Chip, ChipRow, OptionCard, Section, StepStatus, WizardScreen } from '@/components/wizard/ui';
import { content } from '@/content';
import { CHOICE_KEYS } from '@/rules/choices';
import { draftIssues, originFeats, setBackground, setSpecies } from '@/rules/creation';

const SIZE_NAMES: Record<string, string> = { Small: 'Маленький', Medium: 'Средний', Large: 'Большой' };

export default function CreateOriginScreen() {
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
