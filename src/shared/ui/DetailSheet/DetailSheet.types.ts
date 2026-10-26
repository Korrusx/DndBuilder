/** Что показывает шторка с описанием: заклинание, черта, воззвание, вид, предмет… */
export type DetailContent = {
  title: string;
  /** «1 круг · Воплощение», «Черта происхождения». */
  subtitle?: string;
  /** Метки под заголовком: «Концентрация», «Ритуал». */
  tags?: string[];
  /** Плитки с главными числами: время, дистанция, урон… */
  tiles?: { label: string; value: string }[];
  text: string;
  /** Дополнительные разделы текста («На более высоких кругах»). */
  sections?: { title: string; text: string }[];
};

/** Выбор из шторки: большая кнопка «Выбрать» / «Убрать из выбранных». */
export type DetailChoice = {
  isSelected: (id: string) => boolean;
  /** Почему этот вариант нельзя выбрать (например, «уже выбрано»). */
  reason?: (id: string) => string | undefined;
  picked: number;
  max: number;
  onToggle: (id: string) => void;
  /** Подпись кнопки, если вариант не выбирают, а добавляют («Добавить»): кнопка доступна всегда. */
  actionLabel?: string;
};

export type DetailSheetProps = {
  /** Текущий (отфильтрованный) список: стрелки и свайп влево-вправо листают его. */
  ids: string[];
  /** Открытый вариант; null — шторка закрыта. */
  id: string | null;
  detail: (id: string) => DetailContent | null;
  onNavigate: (id: string) => void;
  onClose: () => void;
  /** Без выбора — шторка только для чтения (режим игры). */
  choice?: DetailChoice;
};
