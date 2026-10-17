import { emptyGameState, newDraftCharacter } from './character';
import type { Character } from './types';

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
    equippedSlots: saved.equippedSlots ?? {},
    state: { ...emptyGameState(), ...saved.state },
    status: saved.status ?? meta.status ?? defaults.status,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
  };
}
