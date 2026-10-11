import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import type { IconName } from '../model/types';

/** Иконка вкладки нижнего бара. */
export const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => <MaterialCommunityIcons name={name} color={color as string} size={size} />;
