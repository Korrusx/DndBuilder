import { colors } from '@/shared/config';
import { View } from 'react-native';
import { AppText } from '../AppText/AppText';
import { styles } from './Hint.styles';
import type { HintProps } from './Hint.types';

/** Подсказка в акцентной плашке. */
export function Hint({ children }: HintProps) {
  return (
    <View style={styles.hint}>
      <AppText style={{ color: colors.accent, fontSize: 14, lineHeight: 20 }}>{children}</AppText>
    </View>
  );
}
