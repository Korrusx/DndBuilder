import type { DetailContent } from '../DetailSheet/DetailSheet.types';
import type { GameIconName } from '../GameIcon/GameIcon.types';

/** Вариант в полноэкранном выборе. */
export type PickItem = {
  id: string;
  title: string;
  summary?: string;
  /** Маленькие метки рядом с названием: «К», «Р». */
  tags?: string[];
  /** Почему вариант нельзя выбрать («уже выбрано»). */
  reason?: string;
  /** Ключи фильтров, под которые подходит вариант. */
  filters?: string[];
  /** Дополнительный текст для поиска (например, название на другом языке). */
  search?: string;
  /** Иконка слева от названия. */
  icon?: GameIconName;
};

/** Вариант вместе с описанием для шторки. */
export type ChoiceEntry = PickItem & { detail: DetailContent };

/** Фильтр-плашка. Внутри группы — «или», между группами — «и». */
export type PickFilter = { key: string; label: string; group: string };

export type PickerScreenProps = {
  visible: boolean;
  title: string;
  items: PickItem[];
  filters?: PickFilter[];
  selected: string[];
  max: number;
  onChange: (ids: string[]) => void;
  detail: (id: string) => DetailContent | null;
  /** «Назад» и системная кнопка «назад». */
  onClose: () => void;
  /** Следующий раздел выбора; без него кнопка внизу — «Готово» и закрывает экран. */
  onNext?: () => void;
};
