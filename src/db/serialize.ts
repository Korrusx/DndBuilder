// Превращение персонажа в строку таблицы и обратно.

import { emptyGameState, newDraftCharacter, type Character } from '@/rules/character';

export type CharacterRow = {
  id: string;
  name: string;
  status: 'draft' | 'ready';
  draft_step: number | null;
  data: string;
  created_at: string;
  updated_at: string;
};

export function characterToRow(c: Character): CharacterRow {
  return {
    id: c.id,
    name: c.name,
    status: c.status.kind,
    draft_step: c.status.kind === 'draft' ? c.status.step : null,
    data: JSON.stringify(c),
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

/**
 * Читает персонажа из строки. Поля, которых нет в сохранённом JSON (например, их добавили
 * в модель позже), заполняются значениями по умолчанию, чтобы старые персонажи не ломались.
 */
export function rowToCharacter(row: CharacterRow): Character {
  const saved = JSON.parse(row.data) as Partial<Character>;
  const defaults = newDraftCharacter(row.id, row.created_at);
  return {
    ...defaults,
    ...saved,
    id: row.id,
    state: { ...emptyGameState(), ...saved.state },
    status: saved.status ?? (row.status === 'ready' ? { kind: 'ready' } : { kind: 'draft', step: row.draft_step ?? 1 }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
