import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, View } from 'react-native';

import { MentionText } from '@/entities/campaign/ui';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { formatTime } from '@/shared/lib/date';
import { AppText } from '@/shared/ui';

import { styles } from './TimelineNoteCard.styles';
import type { TimelineNoteCardProps } from './TimelineNoteCard.types';

/** Заметка игрока карточкой; долгое нажатие — изменить или удалить. */
export function TimelineNoteCard({ entry, entitiesById, photos, onLongPress, onMentionPress }: TimelineNoteCardProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <View style={styles.gutter}>
        <View style={styles.dot} />
      </View>
      <Pressable onLongPress={onLongPress} delayLongPress={350} style={styles.card}>
        <View style={styles.meta}>
          <AppText style={styles.time}>{formatTime(entry.createdAt)}</AppText>
          {entry.tags.map((tag) => (
            <AppText key={tag} style={styles.tag}>
              {t(`chronicle.tag.${tag}`)}
            </AppText>
          ))}
          {entry.secret ? <MaterialCommunityIcons name="lock-outline" size={14} color={colors.textSecondary} /> : null}
        </View>
        {entry.text ? (
          <MentionText text={entry.text} entitiesById={entitiesById} onMentionPress={onMentionPress} />
        ) : null}
        {entry.photoIds.length ? (
          <View style={styles.photos}>
            {entry.photoIds
              .filter((id) => photos[id])
              .map((id) => (
                <Image key={id} source={{ uri: photos[id] }} style={styles.photo} />
              ))}
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
