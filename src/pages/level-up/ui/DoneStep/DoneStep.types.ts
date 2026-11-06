import type { CardStat, CardStyle } from '@/features/level-up';

export type DoneStepProps = {
  name: string;
  letter: string;
  portrait?: string;
  subtitle: string;
  level: number;
  stats: CardStat[];
  unlocked: string;
  next: string | null;
  footer: string;
  accessibilityLabel: string;
  /** 20-й уровень: заголовок «Легенда». */
  legend: boolean;
  /** «Записано в хронику · сессия 12»; без кампании строки нет. */
  chronicleText?: string;
  style: CardStyle;
  onStyle: (style: CardStyle) => void;
  onToSheet: () => void;
  /** Заголовок сторис без рода: «Ирма Вейл · 6-й уровень». */
  storyTitle: string;
  /** «Тени Солёной Гавани · сессия 12» внизу сторис; без кампании — нет. */
  campaignLine?: string;
};
