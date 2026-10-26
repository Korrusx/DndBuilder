import { WizardStep } from '@/features/create-character';
import { CreateOriginPage } from '@/pages/create-origin';

export default function OriginStep() {
  return (
    <WizardStep step={2}>
      <CreateOriginPage />
    </WizardStep>
  );
}
