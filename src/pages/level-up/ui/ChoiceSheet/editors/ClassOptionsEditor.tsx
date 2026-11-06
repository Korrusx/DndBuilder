import { ClassOptionsPicker } from '@/features/pick-class-options';

import type { EditorProps } from './editors.types';

/** Воззвания и метамагия (2024): существующий выбор вариантов класса; замена — там же. */
export function ClassOptionsEditor({ next, set }: EditorProps) {
  return (
    <ClassOptionsPicker
      character={next}
      onChoice={(key, ids) => set((c) => ({ ...c, choices: { ...c.choices, [key]: ids } }))}
    />
  );
}
