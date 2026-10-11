import { magicInitiateSlots, spellLimits, spellOptions } from '@/entities/character';
import { draftIssues, StepStatus, useDraft, WizardScreen } from '@/features/create-character';
import { content, nameOf, spellName } from '@/shared/content';
import { MultiPick, Section } from '@/shared/ui';
import { applyKit } from '../../lib/applyKit';
import { EquipmentSection } from '../EquipmentSection/EquipmentSection';
import { MagicInitiate } from '../MagicInitiate/MagicInitiate';

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
