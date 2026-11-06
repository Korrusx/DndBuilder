import { Pressable, Text, View } from 'react-native';

import { t } from '@/shared/i18n';
import { formatDie } from '@/shared/lib/dice';
import { BottomSheet } from '@/shared/ui';

import { styles } from './ManualDieSheet.styles';
import type { ManualDieSheetProps } from './ManualDieSheet.types';

/** «Ввести свой кубик»: сетка чисел от 1 до максимума кости — другое число ввести нельзя. */
export function ManualDieSheet({ visible, die, onPick, onClose }: ManualDieSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      title={t('levelUpDeck.hpCard.manualTitle', { die: formatDie(die) })}
      onClose={onClose}
    >
      <View style={styles.grid}>
        {Array.from({ length: die }, (_, i) => i + 1).map((n) => (
          <Pressable key={n} accessibilityRole="button" onPress={() => onPick(n)} style={styles.cell}>
            <Text style={styles.cellText}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}
