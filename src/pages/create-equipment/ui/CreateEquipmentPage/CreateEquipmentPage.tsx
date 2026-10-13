import { CHOICE_KEYS, hasSpellbook, magicInitiateSlots, preparableSpells, setSpellbook, spellbook, spellbookMinimum, spellLimits, spellOptions, subclassSpellIds } from '@/entities/character';
import { StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import { byId, content, nameOf, spellName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { Hint, MultiPick, Section } from '@/shared/ui';

import { applyKit } from '../../lib/applyKit';
import { EquipmentSection } from '../EquipmentSection/EquipmentSection';
import { MagicInitiate } from '../MagicInitiate/MagicInitiate';

export function CreateEquipmentPage() {
  const { character: c, update, issues: allIssues } = useDraft();
  const { t } = useTranslation();
  const issues = allIssues.filter((i) => i.step === 5);
  const setChoice = (key: string, ids: string[]) => update((d) => ({ ...d, choices: { ...d.choices, [key]: ids } }));
  const limits = spellLimits(c, content);
  // 2014: бард, следопыт, чародей, колдун знают заклинания, а не готовят их.
  const known = limits ? byId.classes.get(limits.classId)?.spellcasting?.preparation === 'known' : false;
  const alwaysPrepared = subclassSpellIds(c, content);

  return (
    <WizardScreen step={5} canContinue={issues.length === 0} summary={<StepStatus issues={issues} />} prepare={applyKit}>
      <EquipmentSection source="class" title={t('equipmentStep.kit', { name: nameOf('classes', c.classes[0]?.classId) })} />
      <EquipmentSection source="background" title={t('equipmentStep.kit', { name: nameOf('backgrounds', c.backgroundId) })} />

      {limits ? (
        <>
          <Section title={t('equipmentStep.cantrips')} picked={c.cantrips.length} need={limits.cantrips}>
            <MultiPick
              options={spellOptions(limits.classId, 0, content)}
              selected={c.cantrips}
              max={limits.cantrips}
              label={spellName}
              onChange={(cantrips) => update((d) => ({ ...d, cantrips }))}
            />
          </Section>
          {hasSpellbook(c) ? (
            <Section title={t('equipmentStep.spellbook')} hint={t('equipmentStep.spellbookHint')} picked={spellbook(c).length} need={spellbookMinimum(c)}>
              <MultiPick
                options={spellOptions('wizard', 1, content)}
                selected={c.choices[CHOICE_KEYS.spellbook] ?? []}
                max={spellbookMinimum(c)}
                label={spellName}
                onChange={(ids) => update((d) => setSpellbook(d, ids, content))}
              />
            </Section>
          ) : null}
          <Section title={known ? t('equipmentStep.knownSpells') : t('equipmentStep.spells')} picked={c.preparedSpells.length} need={limits.prepared}>
            {alwaysPrepared.length ? <Hint>{t('equipmentStep.subclassSpells', { list: alwaysPrepared.map(spellName).join(', ') })}</Hint> : null}
            <MultiPick
              options={preparableSpells(c, content, limits.classId, 1)}
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
