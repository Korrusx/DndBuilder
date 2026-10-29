import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { formatDate } from '@/shared/lib/date';
import { AppText, BottomSheet, SmallButton } from '@/shared/ui';

import { heroLabel } from '../../lib/helpers';
import { styles } from './HallSheet.styles';
import type { HallSheetProps } from './HallSheet.types';

/** «Зал героев»: павшие и ушедшие на покой — уровень, эпитафия, когда покинули отряд. */
export function HallSheet({ visible, heroes, onClose, onRestore }: HallSheetProps) {
  const { t } = useTranslation();
  return (
    <BottomSheet visible={visible} title={t('chronicle.hall.title')} onClose={onClose}>
      {heroes.map((hero) => (
        <View key={hero.character.id} style={styles.hero}>
          <AppText style={styles.name}>{heroLabel(hero.character)}</AppText>
          <AppText variant="secondary">
            {[
              t(`chronicle.hall.${hero.participant.status === 'retired' ? 'retired' : 'fallen'}`),
              hero.participant.leftAt ? formatDate(hero.participant.leftAt) : '',
            ]
              .filter(Boolean)
              .join(' · ')}
          </AppText>
          {hero.participant.epitaph ? <AppText style={styles.epitaph}>«{hero.participant.epitaph}»</AppText> : null}
          <SmallButton title={t('chronicle.hall.restore')} onPress={() => onRestore(hero)} />
        </View>
      ))}
    </BottomSheet>
  );
}
