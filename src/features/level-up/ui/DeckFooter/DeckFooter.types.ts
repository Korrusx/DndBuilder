export type DeckFooterProps = {
  title: string;
  ready: boolean;
  /** «Осталось открыть 3 карты и сделать 1 выбор» / «Всё открыто · можно к итогу». */
  hint: string;
  onNext: () => void;
  /** Нажатие на неактивную кнопку: к первой незавершённой карте. */
  onBlocked: () => void;
};
