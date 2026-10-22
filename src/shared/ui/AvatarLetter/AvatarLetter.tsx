import { View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './AvatarLetter.styles';
import type { AvatarLetterProps } from './AvatarLetter.types';

/** Квадрат с первой буквой имени персонажа. */
export function AvatarLetter({ letter, size = 'sm', dim = false }: AvatarLetterProps) {
  return (
    <View style={[size === 'lg' ? styles.lg : styles.sm, dim && styles.dim]}>
      <AppText style={[size === 'lg' ? styles.letterLg : styles.letterSm, dim && styles.letterDim]}>{letter}</AppText>
    </View>
  );
}
