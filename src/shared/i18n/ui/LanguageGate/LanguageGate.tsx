import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { loadLanguage } from '../../model/language';
import type { LanguageGateProps } from './LanguageGate.types';

/** Показывает приложение, когда сохранённый язык уже загружен из базы, — чтобы не мигал русский текст. */
export function LanguageGate({ children }: LanguageGateProps) {
  const db = useSQLiteContext();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadLanguage(db).finally(() => setReady(true));
  }, [db]);

  return ready ? children : null;
}
