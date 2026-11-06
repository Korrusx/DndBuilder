import type { Character } from '@/entities/character';

export type ClassSheetProps = {
  visible: boolean;
  character: Character;
  /** Класс, выбранный сейчас. */
  classId: string;
  onPick: (classId: string) => void;
  onClose: () => void;
};
