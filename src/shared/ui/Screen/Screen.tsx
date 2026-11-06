import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './Screen.styles';
import type { ScreenProps } from './Screen.types';

export function Screen({ children, footer, background }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      {background ? <View style={styles.background}>{background}</View> : null}
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}
