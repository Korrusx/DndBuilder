import { CHOICE_KEYS } from '@/entities/character/config/constants';
import { equipmentChoice, equipmentPicks } from '@/entities/character/model/build';
import { choice1 } from '@/entities/character/model/choices';
import type { EquipmentSource } from '@/entities/character/model/types';
import { useDraft } from '@/features/create-character/model/DraftContext';
import { content } from '@/shared/content/content';
import { equipmentOptionText, nameOf } from '@/shared/content/names';
import { MultiPick } from '@/shared/ui/MultiPick/MultiPick';
import { OptionCard } from '@/shared/ui/OptionCard/OptionCard';
import { Section } from '@/shared/ui/Section/Section';
import { LETTERS } from '../../config/constants';

export function EquipmentSection({ source, title }: { source: EquipmentSource; title: string }) {
  const { character: c, update } = useDraft();
  const choice = equipmentChoice(c, content, source);
  if (!choice?.options) return null;
  const chosen = choice1(c, CHOICE_KEYS.equipment(source));
  const option = chosen === undefined ? undefined : choice.options[Number(chosen)];

  const select = (i: number) =>
    update((d) => {
      // Выбор предметов внутри прежнего набора больше не нужен.
      const prefix = `equip.${source}.pick.`;
      const choices = Object.fromEntries(Object.entries(d.choices).filter(([k]) => !k.startsWith(prefix)));
      return { ...d, choices: { ...choices, [CHOICE_KEYS.equipment(source)]: [String(i)] } };
    });

  return (
    <Section title={title} picked={option ? 1 : 0} need={1}>
      {choice.options.map((o, i) => (
        <OptionCard
          key={i}
          title={`Вариант ${LETTERS[i] ?? i + 1}`}
          lines={[equipmentOptionText(o)]}
          selected={String(i) === chosen}
          onPress={() => select(i)}
        />
      ))}
      {equipmentPicks(option, content).map((pick) => {
        const key = CHOICE_KEYS.equipmentPick(source, pick.index);
        return (
          <Section key={key} title="Предмет на выбор" picked={c.choices[key]?.length ?? 0} need={1}>
            <MultiPick
              options={pick.options}
              selected={c.choices[key] ?? []}
              max={1}
              label={(id) => nameOf('equipment', id)}
              onChange={(ids) => update((d) => ({ ...d, choices: { ...d.choices, [key]: ids } }))}
            />
          </Section>
        );
      })}
    </Section>
  );
}
