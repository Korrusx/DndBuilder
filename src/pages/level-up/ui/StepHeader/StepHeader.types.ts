export type StepHeaderProps = {
  /** «close» — крестик «Отложить» (У1), «back» — стрелка назад. */
  kind: 'close' | 'back';
  onPress: () => void;
  /** Сегменты прогресса: сколько всего и сколько пройдено. */
  progress?: { total: number; done: number };
  /** Подпись вместо прогресса («Лира · жрица 5 · карта 4 из 6»). */
  caption?: string;
};
