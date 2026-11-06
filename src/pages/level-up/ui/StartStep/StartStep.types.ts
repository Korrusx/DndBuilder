import type { LevelUpCard } from '@/features/level-up';

export type ClassOption = {
  classId: string;
  /** «Плут 6». */
  title: string;
  /** «продолжить путь» / «мультикласс». */
  sub: string;
};

export type StartStepProps = {
  name: string;
  /** «Плут · Вор · 3 новинки, 1 выбор». */
  subtitle: string;
  from: number;
  to: number;
  cards: LevelUpCard[];
  /** Есть следующий уровень — последняя рубашка «Что дальше». */
  hasNext: boolean;
  capstone: boolean;
  animate: boolean;
  /** Выбранный класс уровня и кнопка «Другой класс». */
  current: ClassOption;
  other: ClassOption;
  isOther: boolean;
  /** Смена класса запрещена (хиты уже брошены). */
  classLocked?: string;
  onCurrent: () => void;
  onOther: () => void;
};
