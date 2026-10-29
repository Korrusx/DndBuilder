// Шина событий режима игры: кто-то сообщает «выпала натуральная 20», журнал хроники слушает и записывает.
// Так экранам не нужно знать про хронику, а хронике — про экраны.

import type { PlayEvent, PlayEventListener, PlayEventMessage } from './types';

const listeners = new Set<PlayEventListener>();

export function emitPlayEvent(event: PlayEvent, characterId?: string): void {
  const message: PlayEventMessage = { characterId, event };
  for (const listener of [...listeners]) {
    try {
      listener(message);
    } catch {
      // Журнал не должен ломать игру.
    }
  }
}

/** Подписка на события; возвращает функцию отписки. */
export function onPlayEvent(listener: PlayEventListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
