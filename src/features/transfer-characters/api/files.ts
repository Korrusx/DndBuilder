// Файлы обмена на телефоне: сохранить персонажей в .dnd.json и поделиться; выбрать файл и прочитать его.

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { SQLiteDatabase } from 'expo-sqlite';

import type { ChronicleFile } from '@/entities/campaign';
import { chronicleFileName } from '@/entities/campaign';
import { exportChronicle } from '@/entities/campaign/api';
import type { Character } from '@/entities/character';
import { newId } from '@/entities/character/api';
import { content, contentFor } from '@/shared/content';
import { t } from '@/shared/i18n';

import { buildExchange, exchangeFileName, parseExchange } from '../model/exchange';
import type { ImportResult } from '../model/types';

/** Записывает JSON в файл в кэше приложения (в Expo Go писать можно только туда) и открывает «Поделиться». */
async function shareJson(name: string, data: unknown, dialogTitle: string): Promise<void> {
  const file = new File(Paths.cache, name);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(JSON.stringify(data, null, 1));
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error(t('files.cantShare'));
  }
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle });
}

/** Персонажи в файл .dnd.json (сохранить в Файлы, отправить); можно вместе с хрониками их кампаний. */
export async function shareCharacters(characters: Character[], chronicles: ChronicleFile[] = []): Promise<void> {
  const now = new Date().toISOString();
  await shareJson(
    exchangeFileName(characters, now),
    buildExchange(characters, now, content.version, chronicles),
    t('files.dialogCharacters'),
  );
}

/** Хроника кампании в файл .geroy-chronicle.json (вся летопись, карточки, квесты и фото). */
export async function shareChronicle(db: SQLiteDatabase, campaignId: string): Promise<void> {
  const file = await exportChronicle(db, campaignId);
  if (!file) {
    throw new Error(t('chronicle.notFound'));
  }
  await shareJson(chronicleFileName(file.campaign.name), file, t('chronicle.files.dialog'));
}

/** Открывает выбор файла и читает персонажей. null — пользователь ничего не выбрал. */
export async function pickCharactersFile(): Promise<ImportResult | null> {
  // Тип '*/*': на Android файлы .json из мессенджеров часто приходят без нужного типа.
  // На Android не копируем файл в кэш: в Expo Go копия попадает в папку, которую нельзя читать
  // (Missing READ permission), а ссылку content:// от системного выбора файла читать можно.
  const res = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: Platform.OS !== 'android',
    multiple: false,
  });
  if (res.canceled || !res.assets?.length) {
    return null;
  }
  const text = await new File(res.assets[0].uri).text();
  return parseExchange(text, contentFor, newId, new Date().toISOString());
}
