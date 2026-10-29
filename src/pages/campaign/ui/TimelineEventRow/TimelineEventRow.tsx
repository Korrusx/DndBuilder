import { View } from 'react-native';

import { eventText } from '@/entities/campaign';
import { useTranslation } from '@/shared/i18n';
import { formatTime } from '@/shared/lib/date';
import { AppText, SwipeRow } from '@/shared/ui';

import { styles } from './TimelineEventRow.styles';
import type { TimelineEventRowProps } from './TimelineEventRow.types';

/** Автособытие в летописи: мелкий вторичный текст со временем; смахнуть влево — удалить. */
export function TimelineEventRow({ item, entitiesById, onDelete }: TimelineEventRowProps) {
  const { t } = useTranslation();
  return (
    <SwipeRow onSwiped={onDelete} label={t('common.delete')}>
      <View style={styles.row}>
        <View style={styles.gutter}>
          <View style={styles.dot} />
        </View>
        <AppText style={styles.time}>{formatTime(item.at)}</AppText>
        <AppText style={styles.text}>{eventText(item.event, entitiesById)}</AppText>
      </View>
    </SwipeRow>
  );
}
