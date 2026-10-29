import { TextInput } from 'react-native';

import type { ParticipantStatus } from '@/entities/campaign';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { useResetState } from '@/shared/lib/reset-state';
import { AppText, BottomSheet, Button, Segmented } from '@/shared/ui';

import { heroLabel } from '../../lib/helpers';
import { styles } from './HeroSheet.styles';
import type { HeroSheetProps } from './HeroSheet.types';

type HallStatus = Exclude<ParticipantStatus, 'active'>;

/** Герой кампании: открыть его лист или проводить в «Зал героев» (пал / ушёл на покой) с эпитафией. */
export function HeroSheet({ hero, onClose, onOpenSheet, onToHall }: HeroSheetProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useResetState<HallStatus>('fallen', hero);
  const [epitaph, setEpitaph] = useResetState('', hero);
  const statusOptions = [
    { value: 'fallen' as HallStatus, label: t('chronicle.hall.fallen') },
    { value: 'retired' as HallStatus, label: t('chronicle.hall.retired') },
  ];
  return (
    <BottomSheet visible={!!hero} title={hero ? heroLabel(hero.character) : undefined} onClose={onClose}>
      {hero ? (
        <>
          <Button title={t('chronicle.hero.openSheet')} variant="secondary" onPress={() => onOpenSheet(hero)} />
          <AppText variant="heading">{t('chronicle.hall.title')}</AppText>
          <AppText variant="secondary">{t('chronicle.hero.hallHint')}</AppText>
          <Segmented<HallStatus> value={status} onChange={setStatus} options={statusOptions} />
          <TextInput
            value={epitaph}
            onChangeText={setEpitaph}
            placeholder={t('chronicle.hero.epitaphPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
          <Button title={t('chronicle.hero.toHall')} variant="danger" onPress={() => onToHall(hero, status, epitaph)} />
        </>
      ) : null}
    </BottomSheet>
  );
}
