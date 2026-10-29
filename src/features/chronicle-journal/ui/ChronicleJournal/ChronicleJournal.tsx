// Журнал хроники для открытого персонажа. Ничего не показывает; подключается один раз рядом с CharacterProvider.

import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { Alert, AppState } from 'react-native';

import { usePlay } from '@/entities/character/ui';
import { t } from '@/shared/i18n';

import { startJournal } from '../../api/journal';

export function ChronicleJournal() {
  const db = useSQLiteContext();
  const { character } = usePlay();
  const characterId = character.id;

  useEffect(() => {
    // Если запись не удалась — сказать один раз, а не молчать.
    let warned = false;
    const journal = startJournal(db, characterId, (error) => {
      if (!warned) {
        warned = true;
        Alert.alert(t('chronicle.status.failed'), error instanceof Error ? error.message : String(error));
      }
    });
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
