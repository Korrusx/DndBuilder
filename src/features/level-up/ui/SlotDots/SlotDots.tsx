import { Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { t } from '@/shared/i18n';

import { slotDelay } from '../../lib/motion';
import { styles } from './SlotDots.styles';
import type { SlotDotsProps } from './SlotDots.types';

/** Ячейки кругами (раздел 8): новые кружки появляются по одному с пружиной и светятся. */
export function SlotDots({ slots, before, animate }: SlotDotsProps) {
  let order = 0;
  return (
    <View style={styles.list}>
      {slots.map((count, i) =>
        count > 0 ? (
          <View key={i} style={styles.row}>
            <Text style={[styles.circle, (before[i] ?? 0) === 0 && styles.circleNew]}>
              {t('levelUpDeck.row.slots', { circle: i + 1 })}
            </Text>
            <View style={styles.dots}>
              {Array.from({ length: count }, (_, n) => {
                const fresh = n >= (before[i] ?? 0);
                const delay = fresh ? slotDelay(order++, animate) : 0;
                return fresh && animate ? (
                  <Animated.View
                    key={n}
                    entering={ZoomIn.delay(delay).springify()}
                    style={[styles.dot, styles.dotNew]}
                  />
                ) : (
                  <View key={n} style={[styles.dot, fresh && styles.dotNew]} />
                );
              })}
            </View>
            {count > (before[i] ?? 0) ? <Text style={styles.note}>{t('levelUpDeck.row.newSlots')}</Text> : null}
          </View>
        ) : null,
      )}
    </View>
  );
}
