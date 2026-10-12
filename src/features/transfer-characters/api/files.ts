// Файлы обмена на телефоне: сохранить персонажей в .dnd.json и поделиться; выбрать файл и прочитать его.

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { Character } from '@/entities/character';
import { newId } from '@/entities/character/api';
import { content } from '@/shared/content';
import { t } from '@/shared/i18n/model';

import { buildExchange, exchangeFileName, parseExchange } from '../model/exchange';
import type { ImportResult } from '../model/types';

/** Записывает персонажей в файл в кэше приложения и открывает «Поделиться» (сохранить в Файлы, отправить). */
export async function shareCharacters(characters: Character[]): Promise<void> {
  const now = new Date().toISOString();
  const file = new File(Paths.cache, exchangeFileName(characters, now));
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(buildExchange(characters, now, content.version), null, 1));
  if (!(await Sharing.isAvailableAsync())) throw new Error(t('files.cantShare'));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: t('files.dialogCharacters') });
}

/** Открывает выбор файла и читает персонажей. null — пользователь ничего не выбрал. */
export async function pickCharactersFile(): Promise<ImportResult | null> {
  // Тип '*/*': на Android файлы .json из мессенджеров часто приходят без нужного типа.
  // На Android не копируем файл в кэш: в Expo Go копия попадает в папку, которую нельзя читать
  // (Missing READ permission), а ссылку content:// от системного выбора файла читать можно.
  const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: Platform.OS !== 'android', multiple: false });
  if (res.canceled || !res.assets?.length) return null;
  const text = await new File(res.assets[0].uri).text();
  return parseExchange(text, content, newId, new Date().toISOString());
}
