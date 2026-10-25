import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import type { IconName } from '../model/types';

/** Иконка вкладки нижнего бара. */
export function tabIcon(name: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <MaterialCommunityIcons name={name} color={color as string} size={size} />;
  }
  return TabIcon;
}
