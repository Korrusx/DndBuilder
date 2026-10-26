import { usePathname } from 'expo-router';

import { Freeze } from '@/shared/ui';

import { CREATE_STEPS, FROZEN_STEP_DEPTH } from '../../config/steps';
import type { WizardStepProps } from './WizardStep.types';

/**
 * Шаг мастера в стеке экранов. Шаги на два и больше позади текущего заморожены — изменения черновика их
 * не перерисовывают. Шаг прямо под текущим живой: «Назад» на него открывается сразу, без перерисовки.
 */
export function WizardStep({ step, children }: WizardStepProps) {
  const pathname = usePathname();
  const current = CREATE_STEPS.findIndex((s) => s.route === pathname) + 1;
  return <Freeze freeze={current > 0 && current - step >= FROZEN_STEP_DEPTH}>{children}</Freeze>;
}
