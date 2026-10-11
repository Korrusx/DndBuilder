// Файлы обмена на телефоне: сохранить персонажей в .dnd.json и поделиться; выбрать файл и прочитать его.

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { content } from '@/content';
import type { Character } from '@/rules/character';
import { newId } from './characters';
import { buildExchange, exchangeFileName, parseExchange, type ImportResult } from './exchange';

/** Записывает персонажей в файл в кэше приложения и открывает «Поделиться» (сохранить в Файлы, отправить). */
export async function shareCharacters(characters: Character[]): Promise<void> {
  const now = new Date().toISOString();
  const file = new File(Paths.cache, exchangeFileName(characters, now));
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(buildExchange(characters, now, content.version), null, 1));
  if (!(await Sharing.isAvailableAsync())) throw new Error('На этом устройстве нельзя поделиться файлом.');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Файл персонажей' });
}

/** Открывает выбор файла и читает персонажей. null — пользователь ничего не выбрал. */
export async function pickCharactersFile(): Promise<ImportResult | null> {
  // Тип '*/*': на Android файлы .json из мессенджеров часто приходят без нужного типа.
  const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.length) return null;
  const file = new File(res.assets[0].uri);
  const text = await file.text();
  try {
    file.delete();
  } catch {
    // Копия в кэше — не страшно, если осталась.
  }
  return parseExchange(text, content, newId, new Date().toISOString());
}
