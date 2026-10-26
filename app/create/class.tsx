import { WizardStep } from '@/features/create-character';
import { CreateClassPage } from '@/pages/create-class';

export default function ClassStep() {
  return (
    <WizardStep step={1}>
      <CreateClassPage />
    </WizardStep>
  );
}
