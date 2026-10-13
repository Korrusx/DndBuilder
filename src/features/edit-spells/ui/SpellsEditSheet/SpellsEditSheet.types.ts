import type { Character } from '@/entities/character';

export type SpellsEditSheetProps = {
  visible: boolean;
  character: Character;
  /** Класс, чьи заклинания меняем; по умолчанию — основной заклинатель. */
  classId?: string;
  /** Изменение персонажа (заговоры, подготовленные, книга волшебника). */
  onChange: (fn: (c: Character) => Character) => void;
  onClose: () => void;
};
