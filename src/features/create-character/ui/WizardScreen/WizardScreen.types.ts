import type { Character } from '@/entities/character/model/types';
import { ReactNode } from 'react';

export type WizardScreenProps = {
  step: number;
  children: ReactNode;
  /** Что выбрано на шаге — показывается над кнопкой «Далее». */
  summary?: ReactNode;
  canContinue: boolean;
  /** Вместо «Далее» (последний шаг). */
  footer?: ReactNode;
  /** Изменение перед сохранением (например, записать снаряжение в инвентарь). */
  prepare?: (c: Character) => Character;
};
