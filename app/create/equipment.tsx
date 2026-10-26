import { WizardStep } from '@/features/create-character';
import { CreateEquipmentPage } from '@/pages/create-equipment';

export default function EquipmentStep() {
  return (
    <WizardStep step={5}>
      <CreateEquipmentPage />
    </WizardStep>
  );
}
