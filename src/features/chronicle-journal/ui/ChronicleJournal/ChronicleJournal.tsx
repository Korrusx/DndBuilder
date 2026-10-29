// Журнал хроники для открытого персонажа. Ничего не показывает; подключается один раз рядом с CharacterProvider.

import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { usePlay } from '@/entities/character/ui';

import { startJournal } from '../../api/journal';

export function ChronicleJournal() {
  const db = useSQLiteContext();
  const { character } = usePlay();
  const characterId = character.id;

  useEffect(() => {
    const journal = startJournal(db, characterId, (error) => console.warn('Хроника: событие не записано', error));
    // Свернули приложение, пока копились монеты, — записать сразу.
    const appState = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        journal.flush();
      }
    });
    return () => {
      appState.remove();
      journal.stop();
    };
  }, [db, characterId]);

  return null;
}
