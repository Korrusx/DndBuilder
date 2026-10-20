// Кнопка «PDF»: экспорт с защитой от двойного нажатия и сообщением об ошибке.

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import type { Character } from '@/entities/character';
import { t } from '@/shared/i18n';

import { exportCharacterPdf } from '../api/exportPdf';

export function usePdfExport() {
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async (c: Character) => {
      if (busy) return;
      setBusy(true);
      try {
        await exportCharacterPdf(c);
      } catch (err) {
        Alert.alert(t('files.pdfFailed'), err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );
  return { busy, run };
}
