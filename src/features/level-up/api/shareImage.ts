import { FilterMode, ImageFormat, makeImageFromView, MipmapMode, rect, Skia } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import type { HostInstance } from 'react-native';

/**
 * Снять сцену картинкой нужного размера в px, отправить системным меню и удалить временный файл.
 * Снимает Skia: на Android react-native-view-shot не видит холсты Skia (фон, рамку, кольцо) и отдаёт их пустыми.
 */
export async function shareImage(
  target: RefObject<HostInstance | null>,
  size: { width: number; height: number },
  dialogTitle: string,
): Promise<void> {
  const shot = await makeImageFromView(target as unknown as RefObject<number>);
  const surface = shot ? Skia.Surface.Make(size.width, size.height) : null;
  if (!shot || !surface) {
    throw new Error('Не удалось снять картинку');
  }
  surface
    .getCanvas()
    .drawImageRectOptions(
      shot,
      rect(0, 0, shot.width(), shot.height()),
      rect(0, 0, size.width, size.height),
      FilterMode.Linear,
      MipmapMode.Linear,
    );
  surface.flush();
  const png = surface.makeImageSnapshot().encodeToBytes(ImageFormat.PNG, 100);
  const file = new File(Paths.cache, `level-up-${Date.now()}.png`);
  file.write(png);
  try {
    await Sharing.shareAsync(file.uri, { mimeType: 'image/png', dialogTitle });
  } finally {
    try {
      file.delete();
    } catch {
      // файла уже нет — удалять нечего
    }
  }
}
