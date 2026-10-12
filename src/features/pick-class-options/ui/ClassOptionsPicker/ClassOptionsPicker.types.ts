import type { Character } from '@/entities/character';

export type ClassOptionsPickerProps = {
  character: Character;
  /** Записать выбор под ключом `choices`. */
  onChoice: (key: string, ids: string[]) => void;
};
