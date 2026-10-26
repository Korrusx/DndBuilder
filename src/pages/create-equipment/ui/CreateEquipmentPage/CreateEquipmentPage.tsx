import { useState } from 'react';

import {
  CHOICE_KEYS,
  hasSpellbook,
  magicInitiateSlots,
  preparableSpells,
  setSpellbook,
  spellbook,
  spellbookMinimum,
  spellLimits,
  spellOptions,
  subclassSpellIds,
} from '@/entities/character';
import { SpellPickerField } from '@/entities/character/ui';
import { StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import { byId, content, nameOf, spellName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { pickerSequence } from '@/shared/ui';

import { CLASS_CANTRIPS, CLASS_SPELLBOOK, CLASS_SPELLS } from '../../config/constants';
import { applyKit } from '../../lib/applyKit';
import { takenSpells } from '../../lib/takenSpells';
import { EquipmentSection } from '../EquipmentSection/EquipmentSection';
import { MagicInitiate } from '../MagicInitiate/MagicInitiate';

export function CreateEquipmentPage() {
  const { character, update, issues: allIssues } = useDraft();
  const { t } = useTranslation();
  const issues = allIssues.filter((i) => i.step === 5);
  const setChoice = (key: string, ids: string[]) => update((d) => ({ ...d, choices: { ...d.choices, [key]: ids } }));
  const limits = spellLimits(character, content);
  // 2014: бард, следопыт, чародей, колдун знают заклинания, а не готовят их.
  const known = limits ? byId.classes.get(limits.classId)?.spellcasting?.preparation === 'known' : false;
  const alwaysPrepared = subclassSpellIds(character, content);
  const showPrepared =
    !!limits && (!hasSpellbook(character) || spellbook(character).length >= spellbookMinimum(character));
  const initiates = magicInitiateSlots(character, content);
  // Разделы выбора заклинаний по порядку — для кнопки «Далее» на экране выбора.
  const [openKey, setOpenKey] = useState<string | null>(null);
  const sectionKeys = [
    ...(limits ? [CLASS_CANTRIPS] : []),
    ...(limits && hasSpellbook(character) ? [CLASS_SPELLBOOK] : []),
    ...(showPrepared ? [CLASS_SPELLS] : []),
    ...initiates.flatMap(({ slot, fixedList }) =>
      fixedList || character.choices[CHOICE_KEYS.featSpellList(slot)]?.length
        ? [CHOICE_KEYS.featCantrips(slot), CHOICE_KEYS.featSpell(slot)]
        : [],
    ),
  ];
  const step = pickerSequence(sectionKeys, openKey, setOpenKey);

  return (
    <WizardScreen
      step={5}
      canContinue={issues.length === 0}
      summary={<StepStatus issues={issues} />}
      prepare={applyKit}
    >
      <EquipmentSection
        source="class"
        title={t('equipmentStep.kit', { name: nameOf('classes', character.classes[0]?.classId) })}
      />
      <EquipmentSection
        source="background"
        title={t('equipmentStep.kit', { name: nameOf('backgrounds', character.backgroundId) })}
      />

      {limits ? (
        <>
          <SpellPickerField
            {...step(CLASS_CANTRIPS)}
            title={t('equipmentStep.cantrips')}
            buttonLabel={t('picker.chooseCantrips')}
            options={spellOptions(limits.classId, 0, content)}
            selected={character.cantrips}
            max={limits.cantrips}
            character={character}
            blocked={takenSpells(character, CLASS_CANTRIPS)}
            onChange={(cantrips) => update((d) => ({ ...d, cantrips }))}
          />
          {hasSpellbook(character) ? (
            <SpellPickerField
              {...step(CLASS_SPELLBOOK)}
              title={t('equipmentStep.spellbook')}
              hint={t('equipmentStep.spellbookHint', { count: limits.prepared })}
              buttonLabel={t('picker.chooseSpells')}
              options={spellOptions('wizard', 1, content)}
              selected={character.choices[CHOICE_KEYS.spellbook] ?? []}
              max={spellbookMinimum(character)}
              character={character}
              onChange={(ids) => update((d) => setSpellbook(d, ids, content))}
            />
          ) : null}
          {showPrepared ? (
            <SpellPickerField
              {...step(CLASS_SPELLS)}
              title={known ? t('equipmentStep.knownSpells') : t('equipmentStep.spells')}
              hint={
                alwaysPrepared.length
                  ? t('equipmentStep.subclassSpells', { list: alwaysPrepared.map(spellName).join(', ') })
                  : undefined
              }
              buttonLabel={t('picker.chooseSpells')}
              options={preparableSpells(character, content, limits.classId, 1)}
              selected={character.preparedSpells}
              max={limits.prepared}
              character={character}
              blocked={takenSpells(character, CLASS_SPELLS)}
              onChange={(preparedSpells) => update((d) => ({ ...d, preparedSpells }))}
            />
          ) : null}
        </>
      ) : null}

      {initiates.map(({ slot, fixedList }) => (
        <MagicInitiate key={slot} slot={slot} fixedList={fixedList} setChoice={setChoice} step={step} />
      ))}
    </WizardScreen>
  );
}
