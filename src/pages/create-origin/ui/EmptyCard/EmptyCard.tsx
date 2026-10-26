import { View } from 'react-native';

import { AppText } from '@/shared/ui';

import { styles } from './EmptyCard.styles';
import type { EmptyCardProps } from './EmptyCard.types';

/** Место карточки описания, пока ничего не выбрано. */
export function EmptyCard({ text }: EmptyCardProps) {
  return (
    <View style={styles.empty}>
      <AppText variant="secondary" style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}
