import { WizardStep } from '@/features/create-character';
import { CreateSkillsPage } from '@/pages/create-skills';

export default function SkillsStep() {
  return (
    <WizardStep step={4}>
      <CreateSkillsPage />
    </WizardStep>
  );
}
