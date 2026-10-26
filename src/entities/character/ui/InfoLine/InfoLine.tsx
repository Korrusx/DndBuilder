import { View } from 'react-native';

import { AppText } from '@/shared/ui';

import { styles } from './InfoLine.styles';
import type { InfoLineProps } from './InfoLine.types';

/** Строка «Что даёт»: подпись слева, значение справа. */
export function InfoLine({ label, children }: InfoLineProps) {
  return (
    <View style={styles.line}>
      <AppText variant="secondary" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.value}>{typeof children === 'string' ? <AppText>{children}</AppText> : children}</View>
    </View>
  );
}
