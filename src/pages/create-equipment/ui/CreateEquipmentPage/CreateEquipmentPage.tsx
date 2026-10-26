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
import { StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import { byId, content, nameOf, spellName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { Hint, MultiPick, Section } from '@/shared/ui';

import { CLASS_CANTRIPS, CLASS_SPELLS } from '../../config/constants';
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
          <Section title={t('equipmentStep.cantrips')} picked={character.cantrips.length} need={limits.cantrips}>
            <MultiPick
              options={spellOptions(limits.classId, 0, content)}
              selected={character.cantrips}
              max={limits.cantrips}
              label={spellName}
              blocked={takenSpells(character, CLASS_CANTRIPS)}
              onChange={(cantrips) => update((d) => ({ ...d, cantrips }))}
            />
          </Section>
          {hasSpellbook(character) ? (
            <Section
              title={t('equipmentStep.spellbook')}
              hint={t('equipmentStep.spellbookHint', { count: limits.prepared })}
              picked={spellbook(character).length}
              need={spellbookMinimum(character)}
            >
              <MultiPick
                options={spellOptions('wizard', 1, content)}
                selected={character.choices[CHOICE_KEYS.spellbook] ?? []}
                max={spellbookMinimum(character)}
                label={spellName}
                onChange={(ids) => update((d) => setSpellbook(d, ids, content))}
              />
            </Section>
          ) : null}
          {(!hasSpellbook(character) || spellbook(character).length >= spellbookMinimum(character)) && (
            <Section
              title={known ? t('equipmentStep.knownSpells') : t('equipmentStep.spells')}
              picked={character.preparedSpells.length}
              need={limits.prepared}
            >
              {alwaysPrepared.length ? (
                <Hint>{t('equipmentStep.subclassSpells', { list: alwaysPrepared.map(spellName).join(', ') })}</Hint>
              ) : null}
              <MultiPick
                options={preparableSpells(character, content, limits.classId, 1)}
                selected={character.preparedSpells}
                max={limits.prepared}
                label={spellName}
                blocked={takenSpells(character, CLASS_SPELLS)}
                onChange={(preparedSpells) => update((d) => ({ ...d, preparedSpells }))}
              />
            </Section>
          )}
        </>
      ) : null}

      {magicInitiateSlots(character, content).map(({ slot, fixedList }) => (
        <MagicInitiate key={slot} slot={slot} fixedList={fixedList} setChoice={setChoice} />
      ))}
    </WizardScreen>
  );
}
