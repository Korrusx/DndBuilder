import { View } from 'react-native';

import { entryEvent, eventText, searchEntries } from '@/entities/campaign';
import { MentionText } from '@/entities/campaign/ui';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { styles } from './SearchResults.styles';
import type { SearchResultsProps } from './SearchResults.types';

/** Поиск по хронике: подходящие заметки и события, от новых к старым, с номером сессии («С12»). */
export function SearchResults({ query, entries, sessions, entitiesById }: SearchResultsProps) {
  const { t } = useTranslation();
  const sessionNumber = new Map(sessions.map((session) => [session.id, session.number]));
  const hits = searchEntries(query, entries, entitiesById);
  if (!query.trim()) {
    return <AppText variant="secondary">{t('chronicle.searchHint')}</AppText>;
  }
  if (hits.length === 0) {
    return <AppText variant="secondary">{t('chronicle.searchEmpty')}</AppText>;
  }
  return (
    <View style={styles.list}>
      {hits.map((entry) => {
        const event = entryEvent(entry);
        const number = entry.sessionId ? sessionNumber.get(entry.sessionId) : undefined;
        return (
          <View key={entry.id} style={styles.hit}>
            <AppText style={styles.where}>{number ? t('chronicle.sessionShort', { number }) : '—'}</AppText>
            <View style={styles.body}>
              {event ? (
                <AppText style={styles.event}>{eventText(event, entitiesById)}</AppText>
              ) : (
                <MentionText text={entry.text} entitiesById={entitiesById} />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
