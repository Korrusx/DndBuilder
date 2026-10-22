import {
  choice1,
  CHOICE_KEYS,
  MAGIC_INITIATE_ABILITIES,
  MAGIC_INITIATE_LISTS,
  MAGIC_INITIATE_LISTS_2014,
  spellOptions,
} from '@/entities/character';
import { useDraft } from '@/features/create-character';
import { abilityAbbr, byId, content, nameOf, spellName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Chip, ChipRow, MultiPick, Section } from '@/shared/ui';

import type { MagicInitiateProps } from './MagicInitiate.types';

export function MagicInitiate({ slot, fixedList, setChoice }: MagicInitiateProps) {
  const { character, update } = useDraft();
  const { t } = useTranslation();
  const listKey = CHOICE_KEYS.featSpellList(slot);
  const list = fixedList ?? choice1(character, listKey);
  const abilityKey = CHOICE_KEYS.featAbility(slot);
  const cantripsKey = CHOICE_KEYS.featCantrips(slot);
  const spellKey = CHOICE_KEYS.featSpell(slot);
  // 2014: шесть классов на выбор, характеристика — заклинательная характеристика выбранного класса.
  const is2014 = character.edition === '2014';
  const lists = is2014 ? MAGIC_INITIATE_LISTS_2014 : MAGIC_INITIATE_LISTS;
  const classAbility = (id: string) => byId.classes.get(id)?.spellcasting?.ability;

  return (
    <Section
      title={`${nameOf('feats', 'magic-initiate')} (${slot === 'bgfeat' ? t('magicInitiate.fromBackground') : t('magicInitiate.fromVersatile')})`}
      hint={t('magicInitiate.hint')}
    >
      {fixedList ? (
        <AppText variant="secondary">{t('magicInitiate.list', { name: nameOf('classes', fixedList) })}</AppText>
      ) : (
        <ChipRow>
          {lists.map((id) => (
            <Chip
              key={id}
              label={nameOf('classes', id)}
              selected={list === id}
              onPress={() =>
                update((d) => ({
                  ...d,
                  choices: {
                    ...d.choices,
                    [listKey]: [id],
                    [cantripsKey]: [],
                    [spellKey]: [],
                    ...(is2014 && classAbility(id) ? { [abilityKey]: [classAbility(id)!] } : {}),
                  },
                }))
              }
            />
          ))}
        </ChipRow>
      )}
      {is2014 ? null : (
        <>
          <AppText variant="secondary">{t('magicInitiate.ability')}</AppText>
          <ChipRow>
            {MAGIC_INITIATE_ABILITIES.map((id) => (
              <Chip
                key={id}
                label={abilityAbbr(id)}
                selected={choice1(character, abilityKey) === id}
                onPress={() => setChoice(abilityKey, [id])}
              />
            ))}
          </ChipRow>
        </>
      )}
      {list ? (
        <>
          <Section title={t('magicInitiate.cantrips')} picked={character.choices[cantripsKey]?.length ?? 0} need={2}>
            <MultiPick
              options={spellOptions(list, 0, content)}
              selected={character.choices[cantripsKey] ?? []}
              max={2}
              label={spellName}
              onChange={(ids) => setChoice(cantripsKey, ids)}
            />
          </Section>
          <Section title={t('magicInitiate.spell')} picked={character.choices[spellKey]?.length ?? 0} need={1}>
            <MultiPick
              options={spellOptions(list, 1, content)}
              selected={character.choices[spellKey] ?? []}
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
