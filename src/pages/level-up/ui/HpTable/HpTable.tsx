import { Modal, View } from 'react-native';

import { DiceTable } from '@/features/roll-dice';

import { styles } from './HpTable.styles';
import type { HpTableProps } from './HpTable.types';

/** Существующий 3D-стол бросков поверх колоды: кость хитов ложится — результат уходит в карту. */
export function HpTable({ roll, settings, onLanded, onError }: HpTableProps) {
  return (
    <Modal visible={!!roll} transparent animationType="fade" statusBarTranslucent onRequestClose={onLanded}>
      <View style={styles.backdrop}>
        <View style={styles.table}>
          <DiceTable roll={roll} settings={settings} onLanded={onLanded} onError={onError} />
        </View>
      </View>
    </Modal>
  );
}
