import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { styles } from './MentionsSection.styles';
import type { MentionsSectionProps } from './MentionsSection.types';

/** «Упоминания · N»: записи со снипетами от новых к старым, с номером сессии. */
export function MentionsSection({ hits, sessions }: MentionsSectionProps) {
  const { t } = useTranslation();
  const number = new Map(sessions.map((session) => [session.id, session.number]));
  return (
    <View style={styles.wrap}>
      <AppText style={styles.title}>{t('chronicle.card.mentions', { count: hits.length }).toLocaleUpperCase()}</AppText>
      {hits.length === 0 ? <AppText variant="secondary">{t('chronicle.card.noMentions')}</AppText> : null}
      {hits.map(({ entry, snippet }) => {
        const session = entry.sessionId ? number.get(entry.sessionId) : undefined;
        return (
          <View key={entry.id} style={styles.hit}>
            <AppText style={styles.where}>{session ? t('chronicle.sessionShort', { number: session }) : '—'}</AppText>
            <AppText style={styles.snippet}>{snippet}</AppText>
          </View>
        );
      })}
    </View>
  );
}
