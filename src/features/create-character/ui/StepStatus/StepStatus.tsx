import { AppText } from '@/shared/ui';

import type { StepStatusProps } from './StepStatus.types';

/** Строка над «Далее»: чего не хватает на шаге. */
export function StepStatus({ issues, done }: StepStatusProps) {
  if (issues.length === 0) return done ? <>{done}</> : null;
  return (
    <AppText variant="secondary" numberOfLines={2}>
      {issues[0].message}
      {issues.length > 1 ? ` (и ещё ${issues.length - 1})` : ''}
    </AppText>
  );
}
