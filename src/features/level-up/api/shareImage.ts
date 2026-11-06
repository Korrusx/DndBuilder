import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { HostInstance } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/** Снять сцену картинкой нужного размера в px, отправить системным меню и удалить временный файл. */
export async function shareImage(
  target: HostInstance,
  size: { width: number; height: number },
  dialogTitle: string,
): Promise<void> {
  const uri = await captureRef(target, { format: 'png', quality: 1, result: 'tmpfile', ...size });
  try {
    await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle });
  } finally {
    try {
      new File(uri).delete();
    } catch {
      // файла уже нет — удалять нечего
    }
  }
}
