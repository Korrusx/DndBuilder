import { Pressable, View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { styles } from './UndoBar.styles';
import type { UndoBarProps } from './UndoBar.types';

/** Плашка внизу экрана «Удалено · Вернуть». Когда её прятать, решает экран. */
export function UndoBar({ message, actionLabel, onAction }: UndoBarProps) {
  if (!message) {
    return null;
  }
  return (
    <View style={styles.bar}>
      <AppText style={styles.message}>{message}</AppText>
      <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
        <AppText style={styles.actionText}>{actionLabel}</AppText>
      </Pressable>
    </View>
  );
}
