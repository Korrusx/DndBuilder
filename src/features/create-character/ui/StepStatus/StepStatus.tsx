import { AppText } from '@/shared/ui/AppText/AppText';
import { ReactNode } from 'react';

/** Строка над «Далее»: чего не хватает на шаге. */
export function StepStatus({ issues, done }: { issues: { message: string }[]; done?: ReactNode }) {
  if (issues.length === 0) return done ? <>{done}</> : null;
  return (
    <AppText variant="secondary" numberOfLines={2}>
      {issues[0].message}
      {issues.length > 1 ? ` (и ещё ${issues.length - 1})` : ''}
    </AppText>
  );
}
