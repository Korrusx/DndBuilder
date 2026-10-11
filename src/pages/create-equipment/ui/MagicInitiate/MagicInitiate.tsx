import type { OriginFeatSlot } from '@/entities/character';
import { choice1, CHOICE_KEYS, MAGIC_INITIATE_ABILITIES, MAGIC_INITIATE_LISTS, spellOptions } from '@/entities/character';
import { useDraft } from '@/features/create-character';
import { abilityAbbr, content, nameOf, spellName } from '@/shared/content';
import { AppText, Chip, ChipRow, MultiPick, Section } from '@/shared/ui';

export function MagicInitiate({
  slot,
  fixedList,
  setChoice,
}: {
  slot: OriginFeatSlot;
  fixedList?: string;
  setChoice: (key: string, ids: string[]) => void;
}) {
  const { character: c, update } = useDraft();
  const listKey = CHOICE_KEYS.featSpellList(slot);
  const list = fixedList ?? choice1(c, listKey);
  const abilityKey = CHOICE_KEYS.featAbility(slot);
  const cantripsKey = CHOICE_KEYS.featCantrips(slot);
  const spellKey = CHOICE_KEYS.featSpell(slot);

  return (
    <Section
      title={`${nameOf('feats', 'magic-initiate')} (${slot === 'bgfeat' ? 'предыстория' : 'Универсальность'})`}
      hint="Два заговора и одно заклинание 1-го круга из выбранного списка; его можно сотворить раз в день без ячейки."
    >
      {fixedList ? (
        <AppText variant="secondary">Список заклинаний: {nameOf('classes', fixedList)}</AppText>
      ) : (
        <ChipRow>
          {MAGIC_INITIATE_LISTS.map((id) => (
            <Chip
              key={id}
              label={nameOf('classes', id)}
              selected={list === id}
              onPress={() =>
                update((d) => ({ ...d, choices: { ...d.choices, [listKey]: [id], [cantripsKey]: [], [spellKey]: [] } }))
              }
            />
          ))}
        </ChipRow>
      )}
      <AppText variant="secondary">Характеристика для заклинаний</AppText>
      <ChipRow>
        {MAGIC_INITIATE_ABILITIES.map((id) => (
          <Chip key={id} label={abilityAbbr(id)} selected={choice1(c, abilityKey) === id} onPress={() => setChoice(abilityKey, [id])} />
        ))}
      </ChipRow>
      {list ? (
        <>
          <Section title="Заговоры" picked={c.choices[cantripsKey]?.length ?? 0} need={2}>
            <MultiPick
              options={spellOptions(list, 0, content)}
              selected={c.choices[cantripsKey] ?? []}
              max={2}
              label={spellName}
              onChange={(ids) => setChoice(cantripsKey, ids)}
            />
          </Section>
          <Section title="Заклинание 1-го круга" picked={c.choices[spellKey]?.length ?? 0} need={1}>
            <MultiPick
              options={spellOptions(list, 1, content)}
              selected={c.choices[spellKey] ?? []}
              max={1}
              label={spellName}
              onChange={(ids) => setChoice(spellKey, ids)}
            />
          </Section>
        </>
      ) : null}
    </Section>
  );
}
