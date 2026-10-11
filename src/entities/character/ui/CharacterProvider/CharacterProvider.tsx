// Персонаж в режиме игры: загружается по id, лист пересчитывается из выборов,
// каждое изменение (хиты, ячейки, состояния) сразу сохраняется в базу.

import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { content } from '@/shared/content';
import { AppText, Screen } from '@/shared/ui';
import { getCharacter, saveCharacter } from '../../api/characters';
import { computeSheet } from '../../model/sheet';
import type { Character, GameState, PlayApi } from '../../model/types';

const PlayContext = createContext<PlayApi | null>(null);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null | undefined>(undefined);
  const current = useRef<Character | null>(null);
  // Записи в базу идут строго по очереди, чтобы быстрые нажатия не перезаписали друг друга.
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    getCharacter(db, id).then((c) => {
      current.current = c;
      setCharacter(c);
    });
  }, [db, id]);

  const update = useCallback(
    (fn: (c: Character) => Character) => {
      if (!current.current) return;
      const next = fn(current.current);
      current.current = next;
      setCharacter(next);
      queue.current = queue.current.then(() => saveCharacter(db, next)).catch(() => {});
    },
    [db],
  );

  const updateState = useCallback((fn: (s: GameState) => GameState) => update((c) => ({ ...c, state: fn(c.state) })), [update]);

  const sheet = useMemo(() => {
    if (!character) return null;
    try {
      return computeSheet(character, content);
    } catch {
      return null;
    }
  }, [character]);

  if (character === undefined) return null;
  if (!character || !sheet) {
    return (
      <Screen>
        <AppText variant="heading">Персонаж не найден или повреждён</AppText>
        <AppText variant="secondary">Возможно, он был удалён или ссылается на запись, которой нет в справочнике.</AppText>
      </Screen>
    );
  }

  return <PlayContext.Provider value={{ character, sheet, update, updateState }}>{children}</PlayContext.Provider>;
}

export function usePlay(): PlayApi {
  const api = useContext(PlayContext);
  if (!api) throw new Error('usePlay вне CharacterProvider');
  return api;
}
