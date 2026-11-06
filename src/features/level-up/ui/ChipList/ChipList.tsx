import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { t } from '@/shared/i18n';

import { CHIP_HIT_SLOP, CHIPS_SHOWN, CHIPS_VISIBLE_MAX } from '../../config/constants';
import { styles } from './ChipList.styles';
import type { ChipListProps } from './ChipList.types';

/** Чипы с переносом строк; если их больше шести — первые пять и «+N ещё», нажатие показывает все. */
export function ChipList({ children, moreColor, height = 26 }: ChipListProps) {
  const [all, setAll] = useState(false);
  const folded = !all && children.length > CHIPS_VISIBLE_MAX;
  const shown = folded ? children.slice(0, CHIPS_SHOWN) : children;
  const rest = children.length - CHIPS_SHOWN;
  return (
    <View style={styles.list}>
      {shown}
      {folded ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setAll(true)}
          hitSlop={CHIP_HIT_SLOP}
          style={[styles.more, { height, borderRadius: height / 2 }]}
        >
          <Text style={[styles.moreText, { color: moreColor }]}>
            {t('levelUpDeck.screen.moreChips', { count: rest })}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
