// Персонаж в режиме игры: загружается по id, лист пересчитывается из выборов,
// каждое изменение (хиты, ячейки, состояния) сразу сохраняется в базу.
// Заметные изменения (0 хитов, уровень, предметы, монеты) уходят в шину событий — их записывает хроника кампании.

import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { contentFor, useActiveEdition } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { emitPlayEvent } from '@/shared/lib/play-events';
import { AppText, Screen } from '@/shared/ui';

import { onCharacterChanged } from '../../api/changes';
import { getCharacter, saveCharacter } from '../../api/characters';
import { characterEvents } from '../../model/events';
import { computeSheet } from '../../model/sheet';
import type { Character, GameState, PlayApi, UpdateOptions } from '../../model/types';
import type { CharacterProviderProps } from './CharacterProvider.types';

const PlayContext = createContext<PlayApi | null>(null);

export function CharacterProvider({ children }: CharacterProviderProps) {
  const db = useSQLiteContext();
  const { t } = useTranslation();
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

  // Персонажа изменили в другом месте (выплата из хроники) — перечитать, чтобы не затереть изменение.
  useEffect(
    () =>
      onCharacterChanged((changedId) => {
        if (changedId !== id) {
          return;
        }
        queue.current = queue.current
          .then(() => getCharacter(db, id))
          .then((c) => {
            current.current = c;
            setCharacter(c);
          })
          .catch(() => {});
      }),
    [db, id],
  );

  const update = useCallback(
    (fn: (c: Character) => Character, options?: UpdateOptions) => {
      const prev = current.current;
      if (!prev) {
        return;
      }
      const next = fn(prev);
      current.current = next;
      setCharacter(next);
      queue.current = queue.current.then(() => saveCharacter(db, next)).catch(() => {});
      if (options?.journal !== false) {
        for (const event of characterEvents(prev, next)) {
          emitPlayEvent(event, next.id);
        }
      }
    },
    [db],
  );

  const updateState = useCallback(
    (fn: (s: GameState) => GameState, options?: UpdateOptions) =>
      update((c) => ({ ...c, state: fn(c.state) }), options),
    [update],
  );

  // Экраны режима игры берут справочник редакции персонажа (content / byId).
  useActiveEdition(character?.edition ?? '2024');

  const sheet = useMemo(() => {
    if (!character) {
      return null;
    }
    try {
      return computeSheet(character, contentFor(character.edition));
    } catch {
      return null;
    }
  }, [character]);

  if (character === undefined) {
    return null;
  }
  if (!character || !sheet) {
    return (
      <Screen>
        <AppText variant="heading">{t('play.notFound')}</AppText>
        <AppText variant="secondary">{t('play.notFoundHint')}</AppText>
      </Screen>
    );
  }

  return <PlayContext.Provider value={{ character, sheet, update, updateState }}>{children}</PlayContext.Provider>;
}

export function usePlay(): PlayApi {
  const api = useContext(PlayContext);
  if (!api) {
    throw new Error('usePlay вне CharacterProvider');
  }
  return api;
}
