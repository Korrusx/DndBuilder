import type { ReactNode } from 'react';

export type WizardStepProps = {
  /** Номер шага, 1–6. */
  step: number;
  children: ReactNode;
};
