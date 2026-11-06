import { Pressable } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { styles } from './PendingLevelUpBanner.styles';
import type { PendingLevelUpBannerProps } from './PendingLevelUpBanner.types';

/** Плашка в листе: «Повышение до N-го уровня не завершено · Продолжить». */
export function PendingLevelUpBanner({ level, onContinue }: PendingLevelUpBannerProps) {
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" onPress={onContinue} style={styles.banner}>
      <AppText style={styles.text}>{t('sheet.pendingLevelUp', { level })}</AppText>
      <AppText variant="heading" style={styles.action}>
        {t('sheet.continueLevelUp')}
      </AppText>
    </Pressable>
  );
}
