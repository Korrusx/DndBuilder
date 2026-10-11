import type { ReactNode } from 'react';

export type SectionProps = {
  title: string;
  hint?: string;
  picked?: number;
  need?: number;
  children: ReactNode;
};
