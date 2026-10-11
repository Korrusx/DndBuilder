// Превращение персонажа в строку таблицы и обратно.

import { emptyGameState, newDraftCharacter } from '../model/character';
import type { Character } from '../model/types';
import type { CharacterRow } from './types';

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
  const fallbackStatus: Character['status'] = row.status === 'ready' ? { kind: 'ready' } : { kind: 'draft', step: row.draft_step ?? 1 };
  return withDefaults(saved, { id: row.id, createdAt: row.created_at, updatedAt: row.updated_at, status: fallbackStatus });
}

/** Дополняет сохранённого (или импортированного) персонажа значениями по умолчанию для отсутствующих полей. */
export function withDefaults(
  saved: Partial<Character>,
  meta: { id: string; createdAt: string; updatedAt: string; status?: Character['status'] },
): Character {
  const defaults = newDraftCharacter(meta.id, meta.createdAt);
  return {
    ...defaults,
    ...saved,
    id: meta.id,
    state: { ...emptyGameState(), ...saved.state },
    status: saved.status ?? meta.status ?? defaults.status,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
  };
}
