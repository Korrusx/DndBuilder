import type { Character } from '@/entities/character';
import type { LevelChoice } from '@/features/level-up';

/** Общие пропсы редакторов выбора в шторке: черновик, персонаж до повышения и запись изменения. */
export type EditorProps = {
  choice: LevelChoice;
  prev: Character;
  next: Character;
  set: (fn: (c: Character) => Character) => void;
};
