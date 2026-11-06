export type SlotDotsProps = {
  /** Ячейки по кругам после повышения. */
  slots: number[];
  /** Сколько ячеек каждого круга было до повышения (новые — светятся и появляются по одной). */
  before: number[];
  animate: boolean;
};
