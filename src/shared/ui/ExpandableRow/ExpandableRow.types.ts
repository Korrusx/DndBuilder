export type ExpandableRowProps = {
  title: string;
  /** Одна строка под названием. */
  summary: string;
  /** Полный текст — раскрывается на месте по нажатию. */
  text: string;
  /** Метка справа от названия («с 3-го ур.»). */
  note?: string;
};
