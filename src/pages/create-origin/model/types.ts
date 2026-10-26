/** Строка панели разновидностей под карточкой расы: подраса или вариант особенности (2014: драконий предок). */
export type VariantOption = {
  id: string;
  name: string;
  /** «ЛОВ +2, ХАР +1». */
  bonuses?: string;
  /** Особенности через запятую или вид урона. */
  traits?: string;
  description?: string;
};
