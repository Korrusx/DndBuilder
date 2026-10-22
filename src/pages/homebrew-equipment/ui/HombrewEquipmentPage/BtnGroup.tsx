import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/ui';

import { styles } from './HombrewEquipmentPage.styles';

export function BtnGroup<T extends string>({
  value,
  options,
  onPress,
}: {
  value: T;
  options: { v: T; label: string }[];
  onPress: (v: T) => void;
}) {
  return (
    <View style={styles.btnRow}>
      {options.map((option) => (
        <Pressable
          key={option.v}
          style={[styles.btn, value === option.v && styles.btnActive]}
          onPress={() => onPress(option.v)}
        >
          <AppText style={[styles.btnText, value === option.v && styles.btnTextActive]}>{option.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}
