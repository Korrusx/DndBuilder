// Кнопка «PDF»: экспорт с защитой от двойного нажатия и сообщением об ошибке.

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import type { Character } from '@/rules/character';
import { exportCharacterPdf } from './exportPdf';

export function usePdfExport() {
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async (c: Character) => {
      if (busy) return;
      setBusy(true);
      try {
        await exportCharacterPdf(c);
      } catch (err) {
        Alert.alert('Не удалось создать PDF', err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );
  return { busy, run };
}
