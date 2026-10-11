import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { styles } from './Card.styles';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
