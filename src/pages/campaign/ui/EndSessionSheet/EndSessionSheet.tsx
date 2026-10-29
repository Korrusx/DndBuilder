import { TextInput } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { useResetState } from '@/shared/lib/reset-state';
import { AppText, BottomSheet, Button } from '@/shared/ui';

import { styles } from './EndSessionSheet.styles';
import type { EndSessionSheetProps } from './EndSessionSheet.types';

/** «Завершить сессию» с необязательным «Где остановились?» — его потом зачитает «В прошлый раз…». */
export function EndSessionSheet({ session, onClose, onEnd }: EndSessionSheetProps) {
  const { t } = useTranslation();
  const [text, setText] = useResetState(session?.whereWeStopped ?? '', session);
  return (
    <BottomSheet
      visible={!!session}
      title={session ? t('chronicle.session.endTitle', { number: session.number }) : undefined}
      onClose={onClose}
    >
      <AppText variant="secondary">{t('chronicle.session.whereHint')}</AppText>
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        placeholder={t('chronicle.session.wherePlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      <Button title={t('chronicle.session.end')} onPress={() => onEnd(text)} />
    </BottomSheet>
  );
}
