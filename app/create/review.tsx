import { WizardStep } from '@/features/create-character';
import { CreateReviewPage } from '@/pages/create-review';

export default function ReviewStep() {
  return (
    <WizardStep step={6}>
      <CreateReviewPage />
    </WizardStep>
  );
}
