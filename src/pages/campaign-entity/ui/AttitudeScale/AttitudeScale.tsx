import { Pressable, View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { ATTITUDE_COLORS, ATTITUDES } from '../../config/constants';
import { styles } from './AttitudeScale.styles';
import type { AttitudeScaleProps } from './AttitudeScale.types';

/** «Отношение к нам»: 5 делений от врага до союзника, нажатие выбирает. */
export function AttitudeScale({ value, onChange }: AttitudeScaleProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <AppText style={styles.label}>{t('chronicle.card.attitude').toLocaleUpperCase()}</AppText>
        <AppText style={[styles.current, { color: ATTITUDE_COLORS[value] }]}>
          {t(`chronicle.attitude.${value}`)}
        </AppText>
      </View>
      <View style={styles.row}>
        {ATTITUDES.map((step) => (
          <Pressable
            key={step}
            accessibilityRole="radio"
            accessibilityLabel={t(`chronicle.attitude.${step}`)}
            accessibilityState={{ selected: step === value }}
            onPress={() => onChange(step)}
            style={styles.hit}
          >
            <View style={[styles.segment, step === value && { backgroundColor: ATTITUDE_COLORS[step] }]} />
          </Pressable>
        ))}
      </View>
      <View style={styles.ends}>
        <AppText style={styles.end}>{t('chronicle.attitude.-2')}</AppText>
        <AppText style={styles.end}>{t('chronicle.attitude.2')}</AppText>
      </View>
    </View>
  );
}
