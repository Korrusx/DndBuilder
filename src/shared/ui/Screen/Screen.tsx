import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './Screen.styles';
import type { ScreenProps } from './Screen.types';

export function Screen({ children, footer }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}
