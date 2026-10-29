import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import type { JournalState } from '@/entities/campaign';
import { journalState, participationOf, saveParticipant, useJournalSettings } from '@/entities/campaign/api';
import { usePlay } from '@/entities/character/ui';
import { useTranslation } from '@/shared/i18n';
import { AppText, SmallButton } from '@/shared/ui';

import { styles } from './JournalStatus.styles';

/** Под кнопкой кампании: куда сейчас записываются события героя и что выключено в настройках. */
export function JournalStatus() {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const { character } = usePlay();
  const settings = useJournalSettings();
  const [state, setState] = useState<JournalState>({ kind: 'none' });

  const reload = useCallback(() => {
    journalState(db, character.id)
      .then(setState)
      .catch(() => setState({ kind: 'none' }));
  }, [db, character.id]);
  useFocusEffect(reload);

  if (state.kind === 'none') {
    return null;
  }

  const backToParty = async () => {
    const participation = await participationOf(db, character.id);
    if (participation) {
      await saveParticipant(db, { ...participation, status: 'active', leftAt: undefined, epitaph: undefined });
    }
    reload();
  };

  return (
    <View style={styles.wrap}>
      {state.kind === 'hall' ? (
        <>
          <AppText style={[styles.line, styles.warn]}>{t('chronicle.status.hall')}</AppText>
          <SmallButton title={t('chronicle.hall.restore')} onPress={() => backToParty().catch(() => undefined)} />
        </>
      ) : (
        <AppText style={[styles.line, state.kind === 'session' && styles.live]}>
          {state.kind === 'session'
            ? t('chronicle.status.session', { number: state.number })
            : t('chronicle.status.between')}
        </AppText>
      )}
      {settings.disabled.length ? (
        <AppText style={styles.line}>
          {t('chronicle.status.disabled', {
            list: settings.disabled.map((group) => t(`chronicleSettings.group.${group}`)).join(', '),
          })}
        </AppText>
      ) : null}
    </View>
  );
}
