import type { HeroCardRow } from '@/features/level-up';

export type DoneStepProps = {
  name: string;
  letter: string;
  portrait?: string;
  subtitle: string;
  level: number;
  rows: HeroCardRow[];
  campaignLine?: string;
  /** «Записано в хронику · сессия 12»; нет кампании — плашки нет. */
  chronicleText?: string;
  /** «Увёртливость, Надёжный талант…»; на 20-м уровне — нет. */
  nextLevel?: { level: number; text: string };
  capstone: boolean;
};
