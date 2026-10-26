import { WizardStep } from '@/features/create-character';
import { CreateAbilitiesPage } from '@/pages/create-abilities';

export default function AbilitiesStep() {
  return (
    <WizardStep step={3}>
      <CreateAbilitiesPage />
    </WizardStep>
  );
}
