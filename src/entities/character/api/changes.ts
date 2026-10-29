// Сигнал «персонажа изменили не из режима игры» (например, выплата из хроники): открытый лист перечитывает его из базы.

const listeners = new Set<(characterId: string) => void>();

export function notifyCharacterChanged(characterId: string): void {
  for (const listener of [...listeners]) {
    listener(characterId);
  }
}

export function onCharacterChanged(listener: (characterId: string) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
