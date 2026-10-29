import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { styles } from './RecapButton.styles';
import type { RecapButtonProps } from './RecapButton.types';

/** Большая кнопка «В прошлый раз…» — сводка последней завершённой сессии. */
export function RecapButton({ sessionNumber, onPress }: RecapButtonProps) {
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <MaterialCommunityIcons name="history" size={30} color={colors.onAccent} />
      <View style={styles.text}>
        <AppText style={styles.title}>{t('chronicle.recap.button')}</AppText>
        <AppText style={styles.hint}>{t('chronicle.recap.buttonHint', { number: sessionNumber })}</AppText>
      </View>
    </Pressable>
  );
}
