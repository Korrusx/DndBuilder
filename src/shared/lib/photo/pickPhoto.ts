// Выбор фото из галереи: уменьшается до разумного размера и возвращается как JPEG в base64.

import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { PHOTO_MAX_SIDE, PHOTO_QUALITY } from './constants';

/** `square` — обрезка в квадрат (портрет в круге). null — игрок передумал или не дал доступ. */
export async function pickPhoto(options: { square?: boolean } = {}): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: !!options.square,
    aspect: options.square ? [1, 1] : undefined,
    quality: 1,
  });
  const asset = picked.canceled ? null : picked.assets[0];
  if (!asset) {
    return null;
  }
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(asset.width || PHOTO_MAX_SIDE, asset.height || PHOTO_MAX_SIDE));
  const context = ImageManipulator.manipulate(asset.uri);
  if (scale < 1) {
    context.resize({ width: Math.round(asset.width * scale), height: Math.round(asset.height * scale) });
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: PHOTO_QUALITY, format: SaveFormat.JPEG, base64: true });
  return result.base64 ?? null;
}
