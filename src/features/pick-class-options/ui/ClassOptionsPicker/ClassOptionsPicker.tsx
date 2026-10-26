import {
  classOptionChoices,
  classOptionEntries,
  classOptionSlots,
  meetsPrerequisite,
  tomeSlots,
} from '@/entities/character';
import { SpellPickerField } from '@/entities/character/ui';
import { byId, content } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { ChoiceField } from '@/shared/ui';

import type { ClassOptionsPickerProps } from './ClassOptionsPicker.types';

/** Выбор таинственных воззваний колдуна, метамагии чародея и заклинаний Книги теней. */
export function ClassOptionsPicker({ character, onChoice }: ClassOptionsPickerProps) {
  const { t } = useTranslation();
  const tome = tomeSlots(character, content);

  return (
    <>
      {classOptionSlots(character, content).map((slot) => {
        const chosen = character.choices[slot.key] ?? [];
        // Выбранное, условия которого перестали выполняться, — с пометкой в сводке.
        const entries = classOptionEntries(classOptionChoices(character, content, slot.kind), content).map((entry) => {
          const option = byId.classOptions.get(entry.id);
          return chosen.includes(entry.id) && option && !meetsPrerequisite(character, content, option)
            ? { ...entry, summary: `${t('classOptions.unmet')} · ${entry.summary}` }
            : entry;
        });
        return (
          <ChoiceField
            key={slot.key}
            title={t(`classOptions.${slot.kind}`)}
            hint={t(`classOptions.${slot.kind}Hint`)}
            entries={entries}
            selected={chosen}
            max={slot.count}
            onChange={(ids) => onChoice(slot.key, ids)}
          />
        );
      })}

      {tome ? (
        <>
          <SpellPickerField
            title={t('classOptions.tomeCantrips')}
            hint={t('classOptions.tomeHint')}
            buttonLabel={t('picker.chooseCantrips')}
            options={tome.cantrips.options}
            selected={character.choices[tome.cantrips.key] ?? []}
            max={tome.cantrips.count}
            character={character}
            onChange={(ids) => onChoice(tome.cantrips.key, ids)}
          />
          <SpellPickerField
            title={t('classOptions.tomeRituals')}
            buttonLabel={t('picker.chooseSpells')}
            options={tome.rituals.options}
            selected={character.choices[tome.rituals.key] ?? []}
            max={tome.rituals.count}
            character={character}
            onChange={(ids) => onChoice(tome.rituals.key, ids)}
          />
        </>
      ) : null}
    </>
  );
}
