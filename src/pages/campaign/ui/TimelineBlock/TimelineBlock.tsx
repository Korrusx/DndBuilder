import { Pressable, View } from 'react-native';

import { firstLine } from '@/entities/campaign';
import { useTranslation } from '@/shared/i18n';
import { formatDayMonth, isSameDay } from '@/shared/lib/date';
import { AppText } from '@/shared/ui';

import { TimelineEventRow } from '../TimelineEventRow/TimelineEventRow';
import { TimelineNoteCard } from '../TimelineNoteCard/TimelineNoteCard';
import { styles } from './TimelineBlock.styles';
import type { TimelineBlockProps } from './TimelineBlock.types';

/** Сессия (или записи «между сессиями»): раскрытая — линия времени, свёрнутая — карточка с первой строкой. */
export function TimelineBlock({
  group,
  expanded,
  onToggle,
  entitiesById,
  photos,
  onEndSession,
  onEditStop,
  onDeleteEvent,
  onNoteLongPress,
  onMentionPress,
}: TimelineBlockProps) {
  const { t } = useTranslation();
  const session = group.kind === 'session' ? group.session : null;
  const title = session ? t('chronicle.session.title', { number: session.number }) : t('chronicle.between');
  const date = session
    ? isSameDay(session.startedAt, new Date().toISOString())
      ? t('chronicle.session.today', { date: formatDayMonth(session.startedAt) })
      : formatDayMonth(session.startedAt)
    : '';
  const live = !!session && !session.endedAt;
  const stopped = session?.whereWeStopped?.trim() ?? '';

  if (!expanded) {
    const line = firstLine(group, entitiesById);
    return (
      <Pressable accessibilityRole="button" onPress={onToggle} style={styles.collapsed}>
        <View style={styles.collapsedHeader}>
          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.date}>
            {[date, t('chronicle.entries', { count: group.entryCount })].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        {line ? (
          <AppText variant="secondary" numberOfLines={2}>
            {line}
          </AppText>
        ) : null}
        {stopped ? (
          <AppText style={styles.stoppedLine} numberOfLines={1}>
            {t('chronicle.session.stoppedShort', { text: stopped })}
          </AppText>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={styles.block}>
      <Pressable accessibilityRole="button" onPress={onToggle} style={styles.header}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.date}>{date}</AppText>
        {live ? <AppText style={styles.live}>● {t('chronicle.session.live')}</AppText> : null}
        {live && onEndSession ? (
          <AppText style={styles.end} onPress={onEndSession}>
            {t('chronicle.session.end')}
          </AppText>
        ) : null}
      </Pressable>
      {group.items.length === 0 ? <AppText style={styles.empty}>{t('chronicle.session.empty')}</AppText> : null}
      <View style={styles.items}>
        {group.items.length ? <View style={styles.line} /> : null}
        {group.items.map((item) =>
          item.kind === 'note' ? (
            <TimelineNoteCard
              key={item.entry.id}
              entry={item.entry}
              entitiesById={entitiesById}
              photos={photos}
              onLongPress={() => onNoteLongPress(item.entry)}
              onMentionPress={onMentionPress}
            />
          ) : (
            <TimelineEventRow
              key={item.entries[0].id}
              item={item}
              entitiesById={entitiesById}
              onDelete={() => onDeleteEvent(item)}
            />
          ),
        )}
      </View>
      {session?.endedAt && onEditStop ? (
        stopped ? (
          <Pressable accessibilityRole="button" onPress={onEditStop} style={styles.stopped}>
            <AppText style={styles.stoppedLabel}>{t('chronicle.session.whereTitle').toLocaleUpperCase()}</AppText>
            <AppText style={styles.stoppedText}>{stopped}</AppText>
          </Pressable>
        ) : (
          <AppText style={styles.end} onPress={onEditStop}>
            {t('chronicle.session.whereAdd')}
          </AppText>
        )
      ) : null}
    </View>
  );
}
