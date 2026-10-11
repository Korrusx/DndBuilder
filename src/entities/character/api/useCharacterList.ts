// React-хуки для экранов. Данные перечитываются каждый раз, когда экран снова становится видимым.

import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import type { Character } from '../model/character';
import { listCharacters } from './characters';
import { getMeta } from '@/shared/db/meta';

export function useCharacterList() {
  const db = useSQLiteContext();
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [list, backup] = await Promise.all([listCharacters(db), getMeta(db, 'lastBackupAt')]);
    setCharacters(list);
    setLastBackupAt(backup);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { db, characters, lastBackupAt, reload };
}
