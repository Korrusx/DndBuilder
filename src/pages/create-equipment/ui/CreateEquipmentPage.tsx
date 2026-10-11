import { CHOICE_KEYS, MAGIC_INITIATE_ABILITIES, MAGIC_INITIATE_LISTS } from '@/entities/character/config/constants';
import {
    equipmentChoice,
    equipmentPicks,
    magicInitiateSlots,
    spellLimits,
    spellOptions,
    startingKit
} from '@/entities/character/model/build';
import { choice1 } from '@/entities/character/model/choices';
import type { Character, EquipmentSource, OriginFeatSlot } from '@/entities/character/model/types';
import { useDraft } from '@/features/create-character/model/DraftContext';
import { draftIssues } from '@/features/create-character/model/validation';
import { content } from '@/shared/content/content';
import { abilityAbbr, equipmentOptionText, nameOf, spellName } from '@/shared/content/names';
import { Chip, ChipRow, MultiPick, OptionCard, Section, StepStatus, WizardScreen } from '@/shared/ui/_split/wizard-ui';
import { AppText } from '@/shared/ui/AppText/AppText';

const LETTERS = ['A', 'B', 'C', 'D'];

/** Записывает выбранные наборы в инвентарь и кошелёк. */
function applyKit(c: Character): Character {
  const kit = startingKit(c, content);
  return { ...c, equipment: kit.items, coins: kit.coins };
}

export function CreateEquipmentPage() {
  const { character: c, update } = useDraft();
  const issues = draftIssues(c, content).filter((i) => i.step === 5);
  const setChoice = (key: string, ids: string[]) => update((d) => ({ ...d, choices: { ...d.choices, [key]: ids } }));
  const limits = spellLimits(c, content);

  return (
    <WizardScreen step={5} canContinue={issues.length === 0} summary={<StepStatus issues={issues} />} prepare={applyKit}>
      <EquipmentSection source="class" title={`Снаряжение: ${nameOf('classes', c.classes[0]?.classId)}`} />
      <EquipmentSection source="background" title={`Снаряжение: ${nameOf('backgrounds', c.backgroundId)}`} />

      {limits ? (
        <>
          <Section title="Заговоры" picked={c.cantrips.length} need={limits.cantrips}>
            <MultiPick
              options={spellOptions(limits.classId, 0, content)}
              selected={c.cantrips}
              max={limits.cantrips}
              label={spellName}
              onChange={(cantrips) => update((d) => ({ ...d, cantrips }))}
            />
          </Section>
          <Section title="Подготовленные заклинания 1-го круга" picked={c.preparedSpells.length} need={limits.prepared}>
            <MultiPick
              options={spellOptions(limits.classId, 1, content)}
              selected={c.preparedSpells}
              max={limits.prepared}
              label={spellName}
              onChange={(preparedSpells) => update((d) => ({ ...d, preparedSpells }))}
            />
          </Section>
        </>
      ) : null}

      {magicInitiateSlots(c, content).map(({ slot, fixedList }) => (
        <MagicInitiate key={slot} slot={slot} fixedList={fixedList} setChoice={setChoice} />
      ))}
    </WizardScreen>
  );
}

function EquipmentSection({ source, title }: { source: EquipmentSource; title: string }) {
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

function MagicInitiate({
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
