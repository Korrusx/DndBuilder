import { CHOICE_KEYS, chosenEquipmentOption, equipmentChoices, equipmentPicks } from '@/entities/character';
import { useDraft } from '@/features/create-character';
import { content, equipmentOptionText, nameOf } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { MultiPick, OptionCard, Section } from '@/shared/ui';

import { LETTERS } from '../../config/constants';
import type { EquipmentSectionProps } from './EquipmentSection.types';

/**
 * Стартовое снаряжение класса или предыстории. В 2024 — один выбор (набор A или B); в 2014 — несколько:
 * набор без выбора и «(а) … или (б) …». Вариант без альтернативы выбран сразу.
 */
export function EquipmentSection({ source, title }: EquipmentSectionProps) {
  const { character: c, update } = useDraft();
  const { t } = useTranslation();
  const choices = equipmentChoices(c, content, source);
  if (!choices.length) return null;

  const select = (step: number, i: number) =>
    update((d) => {
      // Выбор предметов внутри прежнего набора больше не нужен.
      const prefix = CHOICE_KEYS.equipmentPick(source, 0, step).replace(/0$/, '');
      const choices = Object.fromEntries(Object.entries(d.choices).filter(([k]) => !k.startsWith(prefix)));
      return { ...d, choices: { ...choices, [CHOICE_KEYS.equipment(source, step)]: [String(i)] } };
    });

  return (
    <>
      {choices.map((choice, step) => {
        const options = choice.options ?? [];
        const option = chosenEquipmentOption(c, choice, source, step);
        const single = options.length === 1;
        return (
          <Section
            key={step}
            title={step === 0 ? title : t('equipmentStep.more')}
            picked={option ? 1 : 0}
            need={1}
          >
            {options.map((o, i) =>
              // Единственный вариант «предмет на выбор» показывается только списком предметов ниже.
              single && o.kind === 'choice' ? null : (
                <OptionCard
                  key={i}
                  title={single ? t('equipmentStep.fixedKit') : t('equipmentStep.option', { letter: LETTERS[i] ?? i + 1 })}
                  lines={[equipmentOptionText(o)]}
                  selected={o === option}
                  onPress={single ? undefined : () => select(step, i)}
                />
              ),
            )}
            {equipmentPicks(option, content).map((pick) => {
              const key = CHOICE_KEYS.equipmentPick(source, pick.index, step);
              return (
                <Section key={key} title={t('equipmentStep.pick')} picked={c.choices[key]?.length ?? 0} need={pick.choose}>
                  <MultiPick
                    options={pick.options}
                    selected={c.choices[key] ?? []}
                    max={pick.choose}
                    label={(id) => nameOf('equipment', id)}
                    onChange={(ids) => update((d) => ({ ...d, choices: { ...d.choices, [key]: ids } }))}
                  />
                </Section>
              );
            })}
          </Section>
        );
      })}
    </>
  );
}
