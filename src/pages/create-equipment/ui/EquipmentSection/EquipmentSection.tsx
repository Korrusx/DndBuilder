import { choice1, CHOICE_KEYS, equipmentChoice, equipmentPicks } from '@/entities/character';
import { useDraft } from '@/features/create-character';
import { content, equipmentOptionText, nameOf } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { MultiPick, OptionCard, Section } from '@/shared/ui';

import { LETTERS } from '../../config/constants';
import type { EquipmentSectionProps } from './EquipmentSection.types';

export function EquipmentSection({ source, title }: EquipmentSectionProps) {
  const { character: c, update } = useDraft();
  const { t } = useTranslation();
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
          title={t('equipmentStep.option', { letter: LETTERS[i] ?? i + 1 })}
          lines={[equipmentOptionText(o)]}
          selected={String(i) === chosen}
          onPress={() => select(i)}
        />
      ))}
      {equipmentPicks(option, content).map((pick) => {
        const key = CHOICE_KEYS.equipmentPick(source, pick.index);
        return (
          <Section key={key} title={t('equipmentStep.pick')} picked={c.choices[key]?.length ?? 0} need={1}>
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
