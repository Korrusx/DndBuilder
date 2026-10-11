import { colors } from '@/shared/config/theme';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '../AppText/AppText';
import { styles } from './Hint.styles';

/** Подсказка в акцентной плашке. */
export function Hint({ children }: { children: ReactNode }) {
  return (
    <View style={styles.hint}>
      <AppText style={{ color: colors.accent, fontSize: 14, lineHeight: 20 }}>{children}</AppText>
    </View>
  );
}
