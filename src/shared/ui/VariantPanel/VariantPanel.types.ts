/** Строка панели: подраса, подкласс или вариант особенности (2014: драконий предок). */
export type VariantOption = {
  id: string;
  name: string;
  /** «ЛОВ +2, ХАР +1». */
  bonuses?: string;
  /** Особенности через запятую или вид урона. */
  traits?: string;
  description?: string;
};

export type VariantPanelProps = {
  options: VariantOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Подсказка над списком («Родословная, предок или наследие — выберите одно»). */
  hint: string;
};
