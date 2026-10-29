import { Alert } from 'react-native';

/** Вопрос с двумя ответами, который можно ждать через await: true — согласились. */
export function confirm(
  title: string,
  message: string,
  yes: string,
  no: string,
  destructive = false,
): Promise<boolean> {
  return new Promise((resolve) =>
    Alert.alert(
      title,
      message,
      [
        { text: no, style: 'cancel', onPress: () => resolve(false) },
        { text: yes, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    ),
  );
}
