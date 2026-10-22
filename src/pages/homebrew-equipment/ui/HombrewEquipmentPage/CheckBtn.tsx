import { Pressable } from 'react-native';

import { AppText } from '@/shared/ui';

import { styles } from './HombrewEquipmentPage.styles';

export function CheckBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.checkBtn, active && styles.checkBtnActive]} onPress={onPress}>
      <AppText style={[styles.checkText, active && styles.checkTextActive]}>{label}</AppText>
    </Pressable>
  );
}
