import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/config';
import { t } from '@/shared/i18n';

import { styles } from './StepHeader.styles';
import type { StepHeaderProps } from './StepHeader.types';

/** Шапка шагов повышения: крестик или «назад», сегменты прогресса или подпись. */
export function StepHeader({ kind, onPress, progress, caption }: StepHeaderProps) {
  // Экран без системной шапки: отступаем под вырез камеры / строку состояния.
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.row, { paddingTop: insets.top }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={kind === 'close' ? t('levelUpPage.postpone') : t('levelUpDeck.back')}
        onPress={onPress}
        style={styles.button}
      >
        <Feather
          name={kind === 'close' ? 'x' : 'chevron-left'}
          size={24}
          color={kind === 'close' ? colors.textSecondary : colors.text}
        />
      </Pressable>
      {caption ? (
        <Text style={styles.caption} numberOfLines={1}>
          {caption}
        </Text>
      ) : (
        <View style={styles.center}>
          {progress
            ? Array.from({ length: progress.total }, (_, i) => (
                <View key={i} style={[styles.segment, i < progress.done && styles.segmentDone]} />
              ))
            : null}
        </View>
      )}
      <View style={styles.spacer} />
    </View>
  );
}
