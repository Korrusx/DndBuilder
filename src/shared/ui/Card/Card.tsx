import { View } from 'react-native';

import { styles } from './Card.styles';
import type { CardProps } from './Card.types';

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}
