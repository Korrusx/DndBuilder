import type { GameIconName } from '../GameIcon/GameIcon.types';

export type ChoiceRowProps = {
  title: string;
  /** Короткая сводка под названием (обрезается многоточием в одну строку). */
  summary?: string;
  /** Маленькие метки рядом с названием: «К», «Р». */
  tags?: string[];
  selected: boolean;
  /** Выбрать нельзя (лимит исчерпан, не выполнены условия); описание открыть можно. */
  disabled?: boolean;
  /** Короткая причина недоступности — в начале сводки. */
  reason?: string;
  /** Иконка слева от названия (виды). */
  icon?: GameIconName;
  /** `add` — кружок с «+»: нажатие добавляет (предметы), а не выбирает. */
  mark?: 'check' | 'add';
  /** Нажатие на строку — открыть описание. */
  onOpen: () => void;
  /** Нажатие на кружок справа — выбрать или снять выбор. */
  onToggle: () => void;
};
