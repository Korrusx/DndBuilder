import type { Character } from "@/entities/character";

// ---------- Проверка ----------

export type Issue = {
  step: number;
  message: string;
  /** false — предупреждение, персонажа всё равно можно сохранить. */
  blocking: boolean;
};

export type DraftApi = {
  character: Character;
  /** Чего не хватает в черновике (draftIssues), пересчитывается только при изменении черновика. */
  issues: Issue[];
  /** Изменить черновик (в памяти). */
  update: (fn: (c: Character) => Character) => void;
  /** Сохранить и перейти к следующему шагу. `prepare` — последнее изменение перед сохранением. */
  next: (step: number, prepare?: (c: Character) => Character) => Promise<void>;
  /** Перейти к шагу (из экрана проверки «Исправить»). */
  goTo: (step: number) => void;
  /** Сохранить готового персонажа и открыть режим игры. */
  finish: () => Promise<void>;
};
