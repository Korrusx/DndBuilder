import { useState } from 'react';
import { View } from 'react-native';

import { chosenClassOptions, classOptionChoices, classOptionSlots, meetsPrerequisite, tomeSlots } from '@/entities/character';
import type { ClassOption } from '@/shared/content';
import { content, plain, spellName, localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import type { InfoContent } from '@/shared/ui';
import { Chip, InfoSheet, MultiPick, Section, SmallButton } from '@/shared/ui';

import { styles } from './ClassOptionsPicker.styles';
import type { ClassOptionsPickerProps } from './ClassOptionsPicker.types';

/** Выбор таинственных воззваний колдуна, метамагии чародея и заклинаний Книги теней. */
export function ClassOptionsPicker({ character: c, onChoice }: ClassOptionsPickerProps) {
  const { t } = useTranslation();
  const [info, setInfo] = useState<InfoContent | null>(null);
  const tome = tomeSlots(c, content);

  const label = (o: ClassOption) => {
    const name = localizeText(o.name).text;
    return o.cost ? t('classOptions.withCost', { name, count: o.cost }) : name;
  };

  return (
    <>
      {classOptionSlots(c, content).map((slot) => {
        const chosen = chosenClassOptions(c, slot.kind);
        const full = chosen.length >= slot.count;
        return (
          <Section
            key={slot.key}
            title={t(`classOptions.${slot.kind}`)}
            hint={t(`classOptions.${slot.kind}Hint`)}
            picked={chosen.length}
            need={slot.count}
          >
            <View style={styles.list}>
              {classOptionChoices(c, content, slot.kind).map((o) => {
                const on = chosen.includes(o.id);
                return (
                  <View key={o.id} style={styles.row}>
                    <View style={styles.fill}>
                      <Chip
                        label={label(o)}
                        selected={on}
                        disabled={!on && full}
                        note={on && !meetsPrerequisite(c, content, o) ? t('classOptions.unmet') : undefined}
                        onPress={() => onChoice(slot.key, on ? chosen.filter((id) => id !== o.id) : [...chosen, o.id])}
                      />
                    </View>
                    <SmallButton title="?" onPress={() => setInfo({ title: localizeText(o.name).text, text: plain(o.description) })} />
                  </View>
                );
              })}
            </View>
          </Section>
        );
      })}

      {tome ? (
        <>
          <Section title={t('classOptions.tomeCantrips')} hint={t('classOptions.tomeHint')} picked={(c.choices[tome.cantrips.key] ?? []).length} need={tome.cantrips.count}>
            <MultiPick
              options={tome.cantrips.options}
              selected={c.choices[tome.cantrips.key] ?? []}
              max={tome.cantrips.count}
              label={spellName}
              onChange={(ids) => onChoice(tome.cantrips.key, ids)}
            />
          </Section>
          <Section title={t('classOptions.tomeRituals')} picked={(c.choices[tome.rituals.key] ?? []).length} need={tome.rituals.count}>
            <MultiPick
              options={tome.rituals.options}
              selected={c.choices[tome.rituals.key] ?? []}
              max={tome.rituals.count}
              label={spellName}
              onChange={(ids) => onChoice(tome.rituals.key, ids)}
            />
          </Section>
        </>
      ) : null}

      <InfoSheet info={info} onClose={() => setInfo(null)} />
    </>
  );
}
